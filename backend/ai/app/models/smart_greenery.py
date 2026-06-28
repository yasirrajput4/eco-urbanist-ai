"""
Smart Greenery Model
Analyzes city layout and places trees/bushes intelligently
ULTRA MODE: Maximum greenery placement
"""
import cv2
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

ICONS_DIR = Path("assets/icons")


class SmartGreeneryModel:
    """
    Intelligent greenery placement on city layouts
    - Detects buildings, roads, water, open spaces
    - Places small tree/bush icons ONLY on valid spots
    - Keeps structures untouched
    """

    def __init__(self):
        logger.info("🧠 Initializing Smart Greenery Model...")
        self.icons = self._load_icons()
        total_icons = sum(len(v) for v in self.icons.values())
        logger.info(f"🌳 Loaded {total_icons} vegetation icons")
        logger.info("✅ Smart Greenery Model ready!")

    def _load_icons(self) -> dict:
        """Load all tree/bush/grass icons"""
        icons = {
            'large_trees': [],
            'medium_trees': [],
            'small_trees': [],
            'bushes': [],
            'grass': []
        }

        if not ICONS_DIR.exists():
            logger.warning("⚠️ Icons directory not found, creating default icons")
            self._create_default_icons()

        # Load icons safely
        for f in ICONS_DIR.glob("tree_large_*.png"):
            try:
                img = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
                if img is not None and img.size > 0:
                    icons['large_trees'].append(img)
            except Exception as e:
                logger.warning(f"Failed to load {f.name}: {e}")

        for f in ICONS_DIR.glob("tree_medium_*.png"):
            try:
                img = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
                if img is not None and img.size > 0:
                    icons['medium_trees'].append(img)
            except Exception as e:
                logger.warning(f"Failed to load {f.name}: {e}")

        for f in ICONS_DIR.glob("tree_small_*.png"):
            try:
                img = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
                if img is not None and img.size > 0:
                    icons['small_trees'].append(img)
            except Exception as e:
                logger.warning(f"Failed to load {f.name}: {e}")

        for f in ICONS_DIR.glob("bush_*.png"):
            try:
                img = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
                if img is not None and img.size > 0:
                    icons['bushes'].append(img)
            except Exception as e:
                logger.warning(f"Failed to load {f.name}: {e}")

        for f in ICONS_DIR.glob("grass_*.png"):
            try:
                img = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
                if img is not None and img.size > 0:
                    icons['grass'].append(img)
            except Exception as e:
                logger.warning(f"Failed to load {f.name}: {e}")

        # Create fallback icons if none loaded
        total_icons = sum(len(v) for v in icons.values())
        if total_icons == 0:
            logger.info("Creating default icons...")
            self._create_default_icons()
            return self._load_icons()

        return icons

    def _create_default_icons(self):
        """Create default icons if not found"""
        ICONS_DIR.mkdir(parents=True, exist_ok=True)

        for i in range(3):
            # Large tree (40px)
            size = 40
            img = np.zeros((size, size, 4), dtype=np.uint8)
            cv2.circle(img, (size//2, size//2), size//2-2, (20, 100, 30, 255), -1)
            cv2.circle(img, (size//2, size//2), size//3, (30, 180, 40, 255), -1)
            cv2.circle(img, (size//2-3, size//2-3), size//5, (60, 220, 80, 255), -1)
            cv2.imwrite(str(ICONS_DIR / f"tree_large_{i}.png"), img)

            # Medium tree (28px)
            size = 28
            img = np.zeros((size, size, 4), dtype=np.uint8)
            cv2.circle(img, (size//2, size//2), size//2-2, (25, 110, 35, 255), -1)
            cv2.circle(img, (size//2, size//2), size//3, (35, 170, 45, 255), -1)
            cv2.circle(img, (size//2-2, size//2-2), size//5, (55, 210, 75, 255), -1)
            cv2.imwrite(str(ICONS_DIR / f"tree_medium_{i}.png"), img)

            # Small tree (18px)
            size = 18
            img = np.zeros((size, size, 4), dtype=np.uint8)
            cv2.circle(img, (size//2, size//2), size//2-1, (30, 140, 40, 255), -1)
            cv2.circle(img, (size//2-1, size//2-1), size//4, (50, 190, 70, 255), -1)
            cv2.imwrite(str(ICONS_DIR / f"tree_small_{i}.png"), img)

            # Bush (22px)
            size = 22
            img = np.zeros((size, size, 4), dtype=np.uint8)
            cv2.circle(img, (size//2, size//2), size//2-1, (35, 160, 45, 255), -1)
            cv2.circle(img, (size//2-2, size//2-2), size//4, (50, 200, 70, 255), -1)
            cv2.imwrite(str(ICONS_DIR / f"bush_{i}.png"), img)

            # Grass (14px)
            size = 14
            img = np.zeros((size, size, 4), dtype=np.uint8)
            cv2.circle(img, (size//2, size//2), size//2-1, (40, 190, 60, 220), -1)
            cv2.circle(img, (size//2-1, size//2-1), size//4, (60, 220, 80, 200), -1)
            cv2.imwrite(str(ICONS_DIR / f"grass_{i}.png"), img)

    def analyze_layout(self, image: np.ndarray) -> dict:
        """
        Analyze city layout to identify different areas

        Returns dict with masks for:
        - buildings: Where structures are
        - roads: Where roads/paths are
        - water: Where water bodies are
        - vegetation: Existing green areas
        - open_space: Where greenery CAN be added
        """
        h, w = image.shape[:2]
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # ---- DETECT BUILDINGS ----
        edges = cv2.Canny(gray, 30, 100)
        edges_dilated = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=2)

        dark_mask = gray < 100
        grey_mask = (hsv[:, :, 1] < 60) & (gray > 40) & (gray < 180)

        buildings_mask = edges_dilated & (dark_mask | grey_mask).astype(np.uint8) * 255
        buildings_mask = cv2.morphologyEx(buildings_mask, cv2.MORPH_CLOSE,
                                         np.ones((7, 7), np.uint8))

        # ---- DETECT ROADS ----
        road_mask = ((hsv[:, :, 1] < 40) & (gray > 150) & (gray < 240)).astype(np.uint8) * 255
        road_mask = cv2.morphologyEx(road_mask, cv2.MORPH_CLOSE,
                                    np.ones((5, 5), np.uint8))

        # ---- DETECT WATER ----
        water_mask = cv2.inRange(hsv, (90, 40, 40), (130, 255, 255))

        # ---- DETECT EXISTING VEGETATION ----
        green_mask = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))

        # ---- CALCULATE OPEN SPACE ----
        protected = np.zeros((h, w), dtype=np.uint8)
        protected = cv2.bitwise_or(protected, buildings_mask)
        protected = cv2.bitwise_or(protected, road_mask)
        protected = cv2.bitwise_or(protected, water_mask)
        protected = cv2.bitwise_or(protected, green_mask)

        # Dilate protected areas (safety margin) - REDUCED for more placement
        protected = cv2.dilate(protected, np.ones((2, 2), np.uint8), iterations=1)

        # Open space = everything NOT protected
        open_space = cv2.bitwise_not(protected)

        # Clean up open space - LESS aggressive for more positions
        open_space = cv2.morphologyEx(open_space, cv2.MORPH_OPEN,
                                     np.ones((2, 2), np.uint8))

        # Calculate percentages
        total_pixels = h * w
        stats = {
            'buildings_mask': buildings_mask,
            'roads_mask': road_mask,
            'water_mask': water_mask,
            'vegetation_mask': green_mask,
            'open_space_mask': open_space,
            'protected_mask': protected,
            'buildings_pct': (np.sum(buildings_mask > 0) / total_pixels) * 100,
            'roads_pct': (np.sum(road_mask > 0) / total_pixels) * 100,
            'water_pct': (np.sum(water_mask > 0) / total_pixels) * 100,
            'existing_green_pct': (np.sum(green_mask > 0) / total_pixels) * 100,
            'open_space_pct': (np.sum(open_space > 0) / total_pixels) * 100,
        }

        return stats

    def _place_icon(self, image: np.ndarray, icon: np.ndarray,
                    x: int, y: int) -> np.ndarray:
        """Place an icon on the image with alpha blending"""
        if icon is None or icon.size == 0:
            return image

        if len(icon.shape) == 3:
            ih, iw = icon.shape[:2]
        else:
            return image

        h, w = image.shape[:2]

        x1 = max(0, x - iw // 2)
        y1 = max(0, y - ih // 2)
        x2 = min(w, x1 + iw)
        y2 = min(h, y1 + ih)

        if x1 >= x2 or y1 >= y2 or x1 >= w or y1 >= h:
            return image

        actual_w = x2 - x1
        actual_h = y2 - y1

        if actual_w != iw or actual_h != ih:
            icon = cv2.resize(icon, (actual_w, actual_h), interpolation=cv2.INTER_LINEAR)

        try:
            if icon.shape[2] == 4:
                alpha = icon[:, :, 3:4].astype(float) / 255.0
                color = icon[:, :, :3].astype(float)

                roi = image[y1:y2, x1:x2].astype(float)

                if roi.shape[:2] == color.shape[:2]:
                    blended = roi * (1 - alpha) + color * alpha
                    image[y1:y2, x1:x2] = blended.astype(np.uint8)
            else:
                if icon.shape[:2] == image[y1:y2, x1:x2].shape[:2]:
                    image[y1:y2, x1:x2] = icon[:, :, :3]
        except Exception:
            pass

        return image

    def _find_valid_positions(self, open_space_mask: np.ndarray,
                              min_spacing: int = 8) -> list:  # REDUCED FROM 15
        """Find valid positions for placing vegetation with minimum spacing"""
        positions = []
        h, w = open_space_mask.shape[:2]

        used_map = np.zeros((h, w), dtype=bool)

        valid_ys, valid_xs = np.where(open_space_mask > 0)

        if len(valid_ys) == 0:
            return positions

        indices = np.random.permutation(len(valid_ys))

        for idx in indices:
            y, x = valid_ys[idx], valid_xs[idx]

            y_start = max(0, y - min_spacing)
            y_end = min(h, y + min_spacing)
            x_start = max(0, x - min_spacing)
            x_end = min(w, x + min_spacing)

            if np.any(used_map[y_start:y_end, x_start:x_end]):
                continue

            used_map[y_start:y_end, x_start:x_end] = True
            positions.append((x, y))

            if len(positions) >= 500:  # INCREASED FROM 300
                break

        return positions

    def add_greenery(self, image: np.ndarray,
                     density: str = "medium") -> tuple:
        """
        Add intelligent greenery to city layout

        Args:
            image: Input city layout (BGR)
            density: "low", "medium", "high", "ultra"

        Returns:
            (result_image, analysis_dict)
        """
        logger.info("🔍 Analyzing city layout...")
        analysis = self.analyze_layout(image)

        logger.info(f"📊 Layout Analysis:")
        logger.info(f"   🏢 Buildings: {analysis['buildings_pct']:.1f}%")
        logger.info(f"   🛣️  Roads: {analysis['roads_pct']:.1f}%")
        logger.info(f"   💧 Water: {analysis['water_pct']:.1f}%")
        logger.info(f"   🌳 Existing Green: {analysis['existing_green_pct']:.1f}%")
        logger.info(f"   📐 Open Space: {analysis['open_space_pct']:.1f}%")

        result = image.copy()
        open_space = analysis['open_space_mask']

        h, w = image.shape[:2]
        img_scale = min(h, w) / 256.0

        # ULTRA MODE ADDED
        density_config = {
            "low": {"spacing": int(35 * img_scale), "tree_ratio": 0.3, "bush_ratio": 0.3, "grass_ratio": 0.4},
            "medium": {"spacing": int(22 * img_scale), "tree_ratio": 0.4, "bush_ratio": 0.3, "grass_ratio": 0.3},
            "high": {"spacing": int(15 * img_scale), "tree_ratio": 0.5, "bush_ratio": 0.3, "grass_ratio": 0.2},
            "ultra": {"spacing": int(8 * img_scale), "tree_ratio": 0.65, "bush_ratio": 0.25, "grass_ratio": 0.1},
        }

        config = density_config.get(density, density_config["ultra"])

        logger.info(f"🌿 Finding placement positions (density: {density})...")
        positions = self._find_valid_positions(open_space, min_spacing=config['spacing'])

        logger.info(f"📍 Found {len(positions)} valid positions")

        if len(positions) == 0:
            logger.warning("⚠️ No open space found! Trying relaxed constraints...")
            positions = self._find_valid_positions(open_space, min_spacing=max(4, config['spacing'] // 2))

            if len(positions) == 0:
                logger.error("❌ No positions found! Image fully occupied.")
                return result, {
                    'initial_green_pct': analysis['existing_green_pct'],
                    'final_green_pct': analysis['existing_green_pct'],
                    'added_green_pct': 0,
                    'buildings_pct': analysis['buildings_pct'],
                    'roads_pct': analysis['roads_pct'],
                    'water_pct': analysis['water_pct'],
                    'open_space_pct': analysis['open_space_pct'],
                    'trees_placed': 0,
                    'bushes_placed': 0,
                    'grass_placed': 0,
                    'total_placed': 0,
                    'density': density
                }
            logger.info(f"✅ Found {len(positions)} with relaxed constraints")

        np.random.shuffle(positions)

        n = len(positions)
        n_trees = int(n * config['tree_ratio'])
        n_bushes = int(n * config['bush_ratio'])
        n_grass = n - n_trees - n_bushes

        tree_positions = positions[:n_trees]
        bush_positions = positions[n_trees:n_trees + n_bushes]
        grass_positions = positions[n_trees + n_bushes:]

        placed_count = {'trees': 0, 'bushes': 0, 'grass': 0}

        def scale_icon(icon, scale_factor):
            """Scale icon based on image size"""
            if scale_factor <= 0.5 or scale_factor > 3.0:
                scale_factor = 1.0
            new_h = max(8, int(icon.shape[0] * scale_factor))
            new_w = max(8, int(icon.shape[1] * scale_factor))
            return cv2.resize(icon, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

        logger.info(f"🌳 Placing {len(tree_positions)} trees...")
        for x, y in tree_positions:
            if np.random.random() < 0.3 and len(self.icons['large_trees']) > 0:
                icon = self.icons['large_trees'][np.random.randint(0, len(self.icons['large_trees']))]
            elif len(self.icons['medium_trees']) > 0:
                icon = self.icons['medium_trees'][np.random.randint(0, len(self.icons['medium_trees']))]
            elif len(self.icons['small_trees']) > 0:
                icon = self.icons['small_trees'][np.random.randint(0, len(self.icons['small_trees']))]
            else:
                continue

            scaled_icon = scale_icon(icon.copy(), img_scale)
            result = self._place_icon(result, scaled_icon, x, y)
            placed_count['trees'] += 1

        logger.info(f"🌿 Placing {len(bush_positions)} bushes...")
        for x, y in bush_positions:
            if len(self.icons['bushes']) > 0:
                icon = self.icons['bushes'][np.random.randint(0, len(self.icons['bushes']))]
                scaled_icon = scale_icon(icon.copy(), img_scale)
                result = self._place_icon(result, scaled_icon, x, y)
                placed_count['bushes'] += 1

        logger.info(f"🌱 Placing {len(grass_positions)} grass patches...")
        for x, y in grass_positions:
            if len(self.icons['grass']) > 0:
                icon = self.icons['grass'][np.random.randint(0, len(self.icons['grass']))]
                scaled_icon = scale_icon(icon.copy(), img_scale)
                result = self._place_icon(result, scaled_icon, x, y)
                placed_count['grass'] += 1

        final_analysis = self.analyze_layout(result)

        result_info = {
            'initial_green_pct': analysis['existing_green_pct'],
            'final_green_pct': final_analysis['existing_green_pct'],
            'added_green_pct': final_analysis['existing_green_pct'] - analysis['existing_green_pct'],
            'buildings_pct': analysis['buildings_pct'],
            'roads_pct': analysis['roads_pct'],
            'water_pct': analysis['water_pct'],
            'open_space_pct': analysis['open_space_pct'],
            'trees_placed': placed_count['trees'],
            'bushes_placed': placed_count['bushes'],
            'grass_placed': placed_count['grass'],
            'total_placed': sum(placed_count.values()),
            'density': density
        }

        logger.info(f"\n✅ Greenery Added Successfully!")
        logger.info(f"   🌳 Trees: {placed_count['trees']}")
        logger.info(f"   🌿 Bushes: {placed_count['bushes']}")
        logger.info(f"   🌱 Grass: {placed_count['grass']}")
        logger.info(f"   📊 Green: {result_info['initial_green_pct']:.1f}% → {result_info['final_green_pct']:.1f}%")

        return result, result_info


_smart_model = None

def get_smart_greenery_model():
    """Get singleton instance"""
    global _smart_model
    if _smart_model is None:
        _smart_model = SmartGreeneryModel()
    return _smart_model