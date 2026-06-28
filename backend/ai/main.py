from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import io
import os
import time
from pathlib import Path
import logging
import random
import asyncio
import gc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    import tensorflow as tf
    from tensorflow import keras
    logger.info("✅ TensorFlow imported successfully")
except ImportError as e:
    logger.error(f"❌ TensorFlow import failed: {e}")
    raise ImportError("TensorFlow not installed")

# Paths
MODEL_PATH = "models/pix2pix_generator.h5"
ICONS_PATH = Path("assets/icons")
OUTPUT_PATH = Path("outputs")
OUTPUT_PATH.mkdir(exist_ok=True)

model = None
tree_icons = {
    'large': [],
    'medium': [],
    'small': [],
    'bush': [],
    'grass': []
}

# Request queue system (only 1 concurrent request)
processing_lock = asyncio.Lock()
active_requests = 0


def load_tree_icons():
    """Load ALL tree icons"""
    global tree_icons

    try:
        if not ICONS_PATH.exists():
            logger.warning(f"⚠️ Icons folder not found at {ICONS_PATH}")
            return

        for i in range(3):
            for icon_type, category in [
                ('tree_large', 'large'),
                ('tree_medium', 'medium'),
                ('tree_small', 'small'),
                ('bush', 'bush'),
                ('grass', 'grass')
            ]:
                icon_path = ICONS_PATH / f"{icon_type}_{i}.png"
                if icon_path.exists():
                    icon = Image.open(icon_path).convert('RGBA')
                    tree_icons[category].append(icon)
                    logger.info(f"✅ Loaded {icon_type}_{i}.png")

        total = sum(len(icons) for icons in tree_icons.values())
        logger.info(f"🌳 TOTAL ICONS LOADED: {total}/15")

    except Exception as e:
        logger.error(f"❌ Error loading icons: {e}")
        import traceback
        traceback.print_exc()


# ==================== LIFESPAN (replaces deprecated @app.on_event) ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic using modern lifespan handler."""
    global model

    # --- Startup ---
    try:
        if os.path.exists(MODEL_PATH):
            logger.info("📥 Loading model...")
            model = keras.models.load_model(MODEL_PATH, compile=False)
            logger.info("✅ Model loaded successfully")
        else:
            logger.warning(f"⚠️ Model not found at {MODEL_PATH}")

        logger.info("🌳 Loading ALL tree icons...")
        load_tree_icons()

    except Exception as e:
        logger.error(f"❌ Error during startup: {e}")
        import traceback
        traceback.print_exc()

    yield  # App runs here

    # --- Shutdown ---
    logger.info("🛑 Shutting down Eco-Urbanist AI...")


# ==================== APP INIT ====================

app = FastAPI(title="Eco-Urbanist AI", version="2.2.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== GREENERY DETECTION ====================

def calculate_accurate_greenery(image_array):
    """Accurate greenery detection"""
    try:
        height, width = image_array.shape[:2]
        total_pixels = height * width

        r, g, b = image_array[:,:,0], image_array[:,:,1], image_array[:,:,2]

        # Method 1: Green dominance
        green_dominant = (g > r + 20) & (g > b + 20) & (g > 90)

        # Method 2: NDVI
        epsilon = 1e-10
        vi = (g.astype(float) - r.astype(float)) / (g.astype(float) + r.astype(float) + epsilon)
        ndvi_green = vi > 0.1

        # Method 3: ExG
        exg = 2 * g.astype(float) - r.astype(float) - b.astype(float)
        exg_normalized = exg / (r.astype(float) + g.astype(float) + b.astype(float) + epsilon)
        exg_green = exg_normalized > 0.15

        # Exclusions
        not_sand = ~((r > 140) & (g > 115) & (b < 130) & (r > b + 30))
        gray_diff = (np.abs(r.astype(int) - g.astype(int)) +
                     np.abs(g.astype(int) - b.astype(int)) +
                     np.abs(r.astype(int) - b.astype(int)))
        not_concrete = gray_diff > 15
        not_sky = ~((b > 140) & (b > g + 20) & (b > r + 20))
        not_water = ~((b > g + 15) & (b > r + 15) & (b > 100))

        # Voting
        votes = (green_dominant.astype(int) + ndvi_green.astype(int) + exg_green.astype(int))
        green_mask = (votes >= 2) & not_sand & not_concrete & not_sky & not_water

        # Morphology
        from scipy import ndimage
        green_mask = ndimage.binary_opening(green_mask, iterations=1)
        green_mask = ndimage.binary_closing(green_mask, iterations=1)

        green_pixels = np.sum(green_mask)
        green_percentage = (green_pixels / total_pixels) * 100

        logger.info(f"      - Green dominant: {np.sum(green_dominant)} pixels")
        logger.info(f"      - NDVI method: {np.sum(ndvi_green)} pixels")
        logger.info(f"      - ExG method: {np.sum(exg_green)} pixels")
        logger.info(f"      - Final result: {green_pixels} pixels ({green_percentage:.4f}%)")

        return green_pixels, green_percentage, green_mask

    except Exception as e:
        logger.error(f"Error in greenery detection: {e}")
        import traceback
        traceback.print_exc()
        r, g, b = image_array[:,:,0], image_array[:,:,1], image_array[:,:,2]
        simple_mask = (g > r) & (g > b) & (g > 100)
        green_px = np.sum(simple_mask)
        height, width = image_array.shape[:2]
        return green_px, (green_px / (height * width)) * 100, simple_mask


# ==================== ENHANCED BUILDING DETECTION ====================

def detect_buildings_enhanced(image_array):
    """
    Enhanced building detection - 10 methods to catch all building types.
    More balanced than ultimate version (not too aggressive).
    """
    try:
        r, g, b = image_array[:,:,0], image_array[:,:,1], image_array[:,:,2]

        gray_diff = (np.abs(r.astype(int) - g.astype(int)) +
                     np.abs(g.astype(int) - b.astype(int)) +
                     np.abs(r.astype(int) - b.astype(int)))
        intensity = (r.astype(int) + g.astype(int) + b.astype(int)) / 3

        # === BUILDING TYPE 1: Gray/Neutral (Concrete, Metal) ===
        gray_neutral = (gray_diff < 30) & (intensity > 100) & (intensity < 200)

        # === BUILDING TYPE 2: White/Bright Buildings ===
        white_buildings = (r > 190) & (g > 190) & (b > 190) & (gray_diff < 25)

        # === BUILDING TYPE 3: Light Gray ===
        light_gray = (gray_diff < 30) & (intensity > 140) & (intensity < 190)

        # === BUILDING TYPE 4: Dark Gray/Shadows ===
        dark_gray = (gray_diff < 25) & (intensity > 40) & (intensity < 100)

        # === BUILDING TYPE 5: Red/Terracotta Roofs ===
        red_roofs = (r > g + 35) & (r > b + 25) & (r > 110) & (r < 210)

        # === BUILDING TYPE 6: Brown/Orange Roofs ===
        brown_roofs = (r > g + 20) & (r > b + 15) & (r > 100) & (r < 190) & (g > 70)

        # === BUILDING TYPE 7: Blue-Gray Modern Glass ===
        blue_gray = (b >= r - 25) & (b >= g - 25) & (intensity > 90) & (intensity < 190) & (gray_diff < 45)

        # === BUILDING TYPE 8: Beige/Tan ===
        beige = (r > 140) & (g > 130) & (b > 95) & (r > b + 25) & (gray_diff < 50)

        # === BUILDING TYPE 9: Yellow Buildings ===
        yellow_buildings = (r > 160) & (g > 150) & (b < 120) & (r > b + 35) & (g > b + 25)

        # === BUILDING TYPE 10: Very Dark (Deep Shadows) ===
        very_dark = (intensity < 45) & (gray_diff < 20)

        # Combine all building types
        all_buildings = (gray_neutral | white_buildings | light_gray | dark_gray |
                        red_roofs | brown_roofs | blue_gray | beige |
                        yellow_buildings | very_dark)

        # Morphological cleanup
        from scipy import ndimage
        all_buildings = ndimage.binary_opening(all_buildings, iterations=1)
        all_buildings = ndimage.binary_closing(all_buildings, iterations=2)

        # Exclude obvious non-buildings
        not_sky = ~((b > 170) & (b > r + 35) & (b > g + 35))
        not_water = ~((b > g + 25) & (b > r + 25) & (b > 130))
        not_vegetation = ~((g > r + 35) & (g > b + 35) & (g > 110))

        all_buildings = all_buildings & not_sky & not_water & not_vegetation

        logger.info(f"   🏢 Building detection: {np.sum(all_buildings):,} pixels (10 methods)")

        return all_buildings

    except Exception as e:
        logger.error(f"Error in building detection: {e}")
        import traceback
        traceback.print_exc()
        r, g, b = image_array[:,:,0], image_array[:,:,1], image_array[:,:,2]
        gray_diff = (np.abs(r.astype(int) - g.astype(int)) +
                     np.abs(g.astype(int) - b.astype(int)) +
                     np.abs(r.astype(int) - b.astype(int)))
        fallback = (gray_diff < 35) & (r > 100) & (r < 200)
        return fallback


# ==================== ICON PLACEMENT HELPERS ====================

def is_position_safe(x, y, building_mask, width, height, safety_radius=10):
    """Check if position is safe"""
    try:
        if x < safety_radius or y < safety_radius:
            return False
        if x >= width - safety_radius or y >= height - safety_radius:
            return False

        y_min = max(0, y - safety_radius)
        y_max = min(height, y + safety_radius)
        x_min = max(0, x - safety_radius)
        x_max = min(width, x + safety_radius)

        area_check = building_mask[y_min:y_max, x_min:x_max]

        if np.any(area_check):
            return False

        return True
    except:
        return False


def place_icon_on_image(base_image, icon, x, y, scale=1.0, building_mask=None):
    """Place tree icon"""
    try:
        if building_mask is not None:
            if not is_position_safe(x, y, building_mask, base_image.width, base_image.height, safety_radius=10):
                return base_image

        new_size = (int(icon.width * scale), int(icon.height * scale))
        if new_size[0] <= 0 or new_size[1] <= 0:
            return base_image

        scaled_icon = icon.resize(new_size, Image.Resampling.LANCZOS)

        paste_x = x - scaled_icon.width // 2
        paste_y = y - scaled_icon.height // 2

        if paste_x < 0 or paste_y < 0:
            return base_image
        if paste_x + scaled_icon.width > base_image.width:
            return base_image
        if paste_y + scaled_icon.height > base_image.height:
            return base_image

        if building_mask is not None:
            icon_y_min = max(0, paste_y)
            icon_y_max = min(base_image.height, paste_y + scaled_icon.height)
            icon_x_min = max(0, paste_x)
            icon_x_max = min(base_image.width, paste_x + scaled_icon.width)

            icon_area = building_mask[icon_y_min:icon_y_max, icon_x_min:icon_x_max]

            if np.sum(icon_area) > (icon_area.size * 0.05):  # Max 5% overlap
                return base_image

        base_image.paste(scaled_icon, (paste_x, paste_y), scaled_icon)

        return base_image

    except Exception as e:
        logger.error(f"Error placing icon: {e}")
        return base_image


def create_green_overlay(original_array, green_mask, intensity=0.55):
    """Create green overlay with reduced intensity"""
    try:
        result = original_array.copy().astype(np.float32)

        green_shades = [
            [34, 139, 34],   # Forest green
            [50, 205, 50],   # Lime green
            [46, 125, 50],   # Dark green
            [76, 175, 80],   # Light green
        ]

        for y in range(result.shape[0]):
            for x in range(result.shape[1]):
                if green_mask[y, x]:
                    shade = random.choice(green_shades)
                    result[y, x] = result[y, x] * (1 - intensity) + np.array(shade) * intensity

        return result.astype(np.uint8)
    except Exception as e:
        logger.error(f"Error creating overlay: {e}")
        return original_array


# ==================== API ENDPOINTS ====================

@app.get("/api/health")
def health_check():
    return {
        "message": "Eco-Urbanist AI Backend 🌳",
        "version": "2.2.0",
        "model_loaded": model is not None,
        "icons_loaded": sum(len(icons) for icons in tree_icons.values()),
        "active_requests": active_requests,
        "features": [
            "Enhanced building detection (10 methods)",
            "Natural tree density",
            "Works with desert AND city images",
            "Accurate greenery analysis"
        ]
    }


@app.get("/api/info")
def root():
    return {
        "message": "Eco-Urbanist AI Backend 🌳",
        "version": "2.2.0",
        "model_loaded": model is not None,
        "icons_loaded": sum(len(icons) for icons in tree_icons.values()),
        "features": [
            "Enhanced building detection (10 methods)",
            "Natural tree density",
            "Works with desert AND city images",
            "Accurate greenery analysis"
        ]
    }


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    """Main prediction endpoint with enhanced building detection"""
    global active_requests

    # Check if another request is processing
    if processing_lock.locked():
        logger.warning("⏳ Server busy - another request is being processed")
        raise HTTPException(
            status_code=503,
            detail="Server is processing another request. Please wait 30-60 seconds and try again."
        )

    # Acquire lock (only 1 request at a time)
    async with processing_lock:
        active_requests += 1
        logger.info(f"🔒 Processing request (active: {active_requests})")

        try:
            start_time = time.time()

            if model is None:
                raise HTTPException(status_code=503, detail="AI model not loaded")

            logger.info(f"📥 Processing: {file.filename}")

            # Read image
            contents = await file.read()
            input_image = Image.open(io.BytesIO(contents)).convert('RGB')
            original_size = input_image.size

            # Limit image size for mobile/large uploads (prevents memory crashes)
            MAX_DIMENSION = 2048
            if original_size[0] > MAX_DIMENSION or original_size[1] > MAX_DIMENSION:
                logger.warning(f"⚠️ Large image ({original_size}), resizing for processing...")
                input_image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
                original_size = input_image.size
                logger.info(f"📐 Resized to: {original_size}")

            logger.info(f"📐 Size: {original_size}")

            original_array = np.array(input_image)

            # Detect input greenery
            logger.info("🔬 Detecting INPUT greenery...")
            input_green_pixels, input_green_pct, input_green_mask = calculate_accurate_greenery(original_array)
            input_total_pixels = original_size[0] * original_size[1]

            logger.info(f"📊 INPUT: {input_green_pct:.4f}% ({input_green_pixels:,}/{input_total_pixels:,} pixels)")

            # Enhanced building detection (10 methods)
            logger.info("🏢 Detecting buildings (enhanced 10-method algorithm)...")
            building_mask = detect_buildings_enhanced(original_array)

            # Moderate expansion (balanced)
            from scipy import ndimage
            building_safety_zone = ndimage.binary_dilation(building_mask, iterations=8)

            logger.info(f"🏢 Buildings: {np.sum(building_mask):,} pixels ({(np.sum(building_mask)/input_total_pixels*100):.1f}%)")
            logger.info(f"🛡️  Safety zone: {np.sum(building_safety_zone):,} pixels ({(np.sum(building_safety_zone)/input_total_pixels*100):.1f}%)")

            # Detect roads and desert
            r, g, b = original_array[:,:,0], original_array[:,:,1], original_array[:,:,2]
            gray_diff = (np.abs(r.astype(int) - g.astype(int)) +
                         np.abs(g.astype(int) - b.astype(int)) +
                         np.abs(r.astype(int) - b.astype(int)))

            road_mask = (gray_diff < 30) & (r > 30) & (r < 140) & (g > 30) & (g < 140)
            sand_mask = (r > 130) & (g > 100) & (b > 60) & (r > b + 20)

            logger.info(f"🛣️  Roads: {np.sum(road_mask):,} pixels ({(np.sum(road_mask)/input_total_pixels*100):.1f}%)")
            logger.info(f"🏜️  Desert: {np.sum(sand_mask):,} pixels ({(np.sum(sand_mask)/input_total_pixels*100):.1f}%)")

            # AI prediction
            logger.info("🤖 Running AI model...")
            input_resized = input_image.resize((256, 256), Image.Resampling.LANCZOS)
            img_array = np.array(input_resized).astype(np.float32)
            img_array = (img_array / 127.5) - 1.0
            img_array = np.expand_dims(img_array, 0)

            prediction = model.predict(img_array, verbose=0)
            output_array = ((prediction[0] + 1.0) * 127.5).astype(np.uint8)
            output_array = np.clip(output_array, 0, 255)

            ai_output = Image.fromarray(output_array, mode='RGB')
            ai_resized = ai_output.resize(original_size, Image.Resampling.LANCZOS)
            ai_array = np.array(ai_resized)

            # Detect AI green
            r_ai, g_ai, b_ai = ai_array[:,:,0], ai_array[:,:,1], ai_array[:,:,2]
            ai_green_mask = (g_ai > r_ai + 10) & (g_ai > b_ai + 10) & (g_ai > 50)

            # Valid placement (excludes buildings)
            valid_green_mask = (ai_green_mask | sand_mask | road_mask) & (~building_safety_zone)

            valid_pixels = np.sum(valid_green_mask)
            logger.info(f"🌳 Valid placement area: {valid_pixels:,} pixels ({(valid_pixels/input_total_pixels*100):.1f}%)")

            # Fallback if too small
            if valid_pixels < (input_total_pixels * 0.1):
                logger.warning("⚠️ Valid area too small - expanding to all non-building areas")
                valid_green_mask = ~building_mask
                valid_pixels = np.sum(valid_green_mask)
                logger.info(f"   🔄 Expanded to {valid_pixels:,} pixels ({(valid_pixels/input_total_pixels*100):.1f}%)")

            # Apply overlay
            logger.info("🎨 Applying green overlay...")
            result_array = create_green_overlay(original_array, valid_green_mask, intensity=0.55)
            result_image = Image.fromarray(result_array).convert('RGBA')

            # Place tree icons
            logger.info("🌲 Placing tree icons (natural density)...")
            labeled, num_features = ndimage.label(valid_green_mask)

            trees_placed = 0
            icon_usage = {'large': 0, 'medium': 0, 'small': 0, 'bush': 0, 'grass': 0}
            max_trees = 80

            regions = []
            for region_id in range(1, num_features + 1):
                coords = np.where(labeled == region_id)
                area_size = len(coords[0])

                if area_size < 50:
                    continue

                center_y = int(np.mean(coords[0]))
                center_x = int(np.mean(coords[1]))

                regions.append({
                    'coords': coords,
                    'center': (center_x, center_y),
                    'area': area_size
                })

            regions.sort(key=lambda x: x['area'], reverse=True)
            logger.info(f"   🎯 Found {len(regions)} regions")

            # Place icons
            placed_regions = 0
            for idx, region in enumerate(regions):
                if trees_placed >= max_trees:
                    break

                if random.random() > 0.6:  # Skip 40%
                    continue

                area = region['area']
                center_x, center_y = region['center']

                if building_mask[center_y, center_x]:
                    continue

                if area > 4000 and tree_icons['large']:
                    icon = random.choice(tree_icons['large'])
                    scale = random.uniform(2.5, 4.0)
                    icon_type = 'large'
                elif area > 1500 and tree_icons['medium']:
                    icon = random.choice(tree_icons['medium'])
                    scale = random.uniform(2.0, 3.0)
                    icon_type = 'medium'
                elif area > 600 and tree_icons['small']:
                    icon = random.choice(tree_icons['small'])
                    scale = random.uniform(1.5, 2.5)
                    icon_type = 'small'
                elif area > 250 and tree_icons['bush']:
                    icon = random.choice(tree_icons['bush'])
                    scale = random.uniform(1.2, 2.0)
                    icon_type = 'bush'
                elif area > 100 and tree_icons['grass']:
                    icon = random.choice(tree_icons['grass'])
                    scale = random.uniform(1.0, 1.6)
                    icon_type = 'grass'
                else:
                    continue

                try:
                    result_image = place_icon_on_image(result_image, icon, center_x, center_y, scale, building_mask)
                    trees_placed += 1
                    icon_usage[icon_type] += 1
                    placed_regions += 1
                except:
                    continue

            logger.info(f"✅ Placed {trees_placed} icons across {placed_regions} regions")

            # Finalize
            try:
                logger.info("🖼️ Finalizing output...")
                final_output = result_image.convert('RGB')
                final_array = np.array(final_output)

                logger.info("🔬 Detecting OUTPUT greenery...")
                output_green_pixels, output_green_pct, _ = calculate_accurate_greenery(final_array)

                logger.info(f"📊 OUTPUT: {output_green_pct:.4f}% ({output_green_pixels:,} pixels)")
            except Exception as e:
                logger.error(f"⚠️ Error in output detection: {e}")
                output_green_pixels = input_green_pixels + int(np.sum(valid_green_mask) * 0.5)
                output_green_pct = (output_green_pixels / input_total_pixels) * 100
                logger.info(f"📊 OUTPUT (estimated): {output_green_pct:.4f}%")
                final_output = result_image.convert('RGB')

            # Save
            try:
                output_filename = f"output_{int(time.time())}.png"
                output_path = OUTPUT_PATH / output_filename
                final_output.save(output_path, format='PNG', quality=98)
                logger.info(f"💾 Saved to {output_filename}")
            except Exception as e:
                logger.error(f"⚠️ Error saving file: {e}")
                output_filename = f"output_{int(time.time())}.png"

            improvement = output_green_pct - input_green_pct
            processing_time = time.time() - start_time

            logger.info(f"✅ Complete in {processing_time:.2f}s | Improvement: +{improvement:.4f}%")

            return {
                "success": True,
                "output_filename": output_filename,
                "green_scores": {
                    "input": {
                        "green_pixels": int(input_green_pixels),
                        "total_pixels": input_total_pixels,
                        "green_score": round(input_green_pct, 4)
                    },
                    "output": {
                        "green_pixels": int(output_green_pixels),
                        "total_pixels": input_total_pixels,
                        "green_score": round(output_green_pct, 4)
                    },
                    "improvement": round(improvement, 4)
                },
                "visualization": {
                    "trees_placed": trees_placed,
                    "icon_breakdown": icon_usage,
                    "regions_used": placed_regions
                },
                "metadata": {
                    "model_trained": True,
                    "processing_time": f"{processing_time:.2f}s",
                    "original_size": f"{original_size[0]}x{original_size[1]}",
                    "version": "2.2.0",
                    "building_detection": "enhanced (10 methods)",
                    "tree_density": "natural"
                }
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))

        finally:
            active_requests -= 1
            logger.info(f"🔓 Request completed (active: {active_requests})")
            gc.collect()
            logger.info("🧹 Memory cleaned up")


@app.get("/api/download/{filename}")
async def download_image(filename: str):
    """Download generated image"""
    try:
        file_path = OUTPUT_PATH / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(file_path, media_type="image/png", filename=filename)
    except Exception as e:
        logger.error(f"Error downloading: {e}")
        raise HTTPException(status_code=500, detail="Download failed")


@app.get("/api/model-info")
def model_info():
    """Get model information"""
    if model is None:
        return {"error": "Model not loaded"}

    return {
        "model_type": "Pix2Pix Generator",
        "version": "2.2.0",
        "status": "trained",
        "building_detection": "Enhanced 10-method algorithm",
        "icons_available": {
            "large_trees": len(tree_icons['large']),
            "medium_trees": len(tree_icons['medium']),
            "small_trees": len(tree_icons['small']),
            "bushes": len(tree_icons['bush']),
            "grass": len(tree_icons['grass']),
            "total": sum(len(icons) for icons in tree_icons.values())
        }
    }


# ==================== SERVE FRONTEND ====================

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

if FRONTEND_DIST.exists():
    assets = FRONTEND_DIST / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=str(assets)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)

        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)

        index = FRONTEND_DIST / "index.html"
        if index.exists():
            return FileResponse(index)

        raise HTTPException(status_code=404)


# ==================== ENTRY POINT ====================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info("🚀 Starting Eco-Urbanist AI v2.2.0 (Enhanced Building Detection + Queue System)")
    uvicorn.run(app, host="0.0.0.0", port=port)