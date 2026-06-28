"""
Semantic Segmentation Service - IMPROVED
Reliable color-based detection for urban images
"""
import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)


class SegmentationService:
    """
    Improved segmentation using color analysis
    More reliable for presentation - no TensorFlow Hub dependency
    """

    def __init__(self):
        logger.info("🧠 Initializing Improved Segmentation Service...")
        logger.info("✅ Using color-based detection (fast & reliable)")

    def segment_image(self, image_path: str) -> dict:
        """
        Segment image using improved color analysis

        Args:
            image_path: Path to input image

        Returns:
            dict: Segmentation masks for different categories
        """
        logger.info(f"🎨 Segmenting image: {image_path}")

        # Load image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Cannot load image: {image_path}")

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        height, width = img.shape[:2]

        logger.info("   Detecting structures...")

        # 1. BUILDINGS - Gray/beige/brown structures with edges
        buildings = self._detect_buildings(img_rgb, img_hsv, img_gray)

        # 2. ROADS - Dark gray, low saturation
        roads = self._detect_roads(img_hsv, img_gray)

        # 3. EXISTING TREES - Green areas
        trees = self._detect_trees(img_hsv)

        # 4. VEHICLES - Small dark objects on roads (optional, simple version)
        vehicles = self._detect_vehicles(img_hsv, img_gray)

        # 5. SKY - Top portion, light blue/white
        sky = self._detect_sky(img_hsv, height, width)

        # 6. WATER - Blue areas (if any)
        water = self._detect_water(img_hsv)

        # 7. AVAILABLE SPACE - Everything else
        occupied = buildings | roads | trees | vehicles | sky | water
        available = ~occupied

        # Post-processing - remove tiny noise
        available = self._clean_mask(available)

        # Calculate percentages
        total_pixels = height * width
        logger.info("✅ Segmentation complete!")
        logger.info(f"   Buildings: {np.sum(buildings)/total_pixels*100:.1f}%")
        logger.info(f"   Roads: {np.sum(roads)/total_pixels*100:.1f}%")
        logger.info(f"   Existing trees: {np.sum(trees)/total_pixels*100:.1f}%")
        logger.info(f"   Available space: {np.sum(available)/total_pixels*100:.1f}%")

        return {
            'buildings': buildings,
            'roads': roads,
            'vehicles': vehicles,
            'trees': trees,
            'sky': sky,
            'water': water,
            'available': available
        }

    def _detect_buildings(self, img_rgb, img_hsv, img_gray):
        """Detect buildings using color + edge detection"""
        height, width = img_rgb.shape[:2]

        # Method 1: Color-based (gray, beige, brown, white)
        # Gray buildings
        lower_gray = np.array([0, 0, 80])
        upper_gray = np.array([180, 30, 220])
        gray_buildings = cv2.inRange(img_hsv, lower_gray, upper_gray)

        # Beige/tan buildings
        lower_beige = np.array([15, 20, 100])
        upper_beige = np.array([35, 100, 255])
        beige_buildings = cv2.inRange(img_hsv, lower_beige, upper_beige)

        # White buildings
        lower_white = np.array([0, 0, 200])
        upper_white = np.array([180, 30, 255])
        white_buildings = cv2.inRange(img_hsv, lower_white, upper_white)

        # Combine color detections
        color_buildings = cv2.bitwise_or(gray_buildings, beige_buildings)
        color_buildings = cv2.bitwise_or(color_buildings, white_buildings)

        # Method 2: Edge-based (buildings have strong edges)
        edges = cv2.Canny(img_gray, 30, 100)

        # Dilate edges to create building regions
        kernel = np.ones((7, 7), np.uint8)
        edge_buildings = cv2.dilate(edges, kernel, iterations=2)

        # Combine both methods
        buildings = cv2.bitwise_or(color_buildings, edge_buildings)

        # Clean up with morphology
        kernel = np.ones((5, 5), np.uint8)
        buildings = cv2.morphologyEx(buildings, cv2.MORPH_CLOSE, kernel)

        return buildings > 0

    def _detect_roads(self, img_hsv, img_gray):
        """Detect roads - dark gray, low saturation"""
        # Roads are typically dark with low saturation
        lower_road = np.array([0, 0, 30])
        upper_road = np.array([180, 40, 120])
        roads = cv2.inRange(img_hsv, lower_road, upper_road)

        # Clean up
        kernel = np.ones((3, 3), np.uint8)
        roads = cv2.morphologyEx(roads, cv2.MORPH_CLOSE, kernel)

        return roads > 0

    def _detect_trees(self, img_hsv):
        """Detect existing vegetation"""
        # Green hue range
        lower_green1 = np.array([35, 40, 40])
        upper_green1 = np.array([85, 255, 255])
        trees1 = cv2.inRange(img_hsv, lower_green1, upper_green1)

        # Yellow-green (grass)
        lower_green2 = np.array([25, 30, 40])
        upper_green2 = np.array([35, 200, 255])
        trees2 = cv2.inRange(img_hsv, lower_green2, upper_green2)

        trees = cv2.bitwise_or(trees1, trees2)

        # Clean up small noise
        kernel = np.ones((3, 3), np.uint8)
        trees = cv2.morphologyEx(trees, cv2.MORPH_OPEN, kernel)

        return trees > 0

    def _detect_vehicles(self, img_hsv, img_gray):
        """Detect vehicles (simplified)"""
        # Vehicles are often dark or colorful
        # Simple detection: very dark areas
        vehicles = img_gray < 60

        # Remove large dark areas (likely shadows, not vehicles)
        kernel = np.ones((15, 15), np.uint8)
        large_dark = cv2.morphologyEx(vehicles.astype(np.uint8) * 255, cv2.MORPH_CLOSE, kernel)
        vehicles = vehicles & (large_dark == 0)

        return vehicles

    def _detect_sky(self, img_hsv, height, width):
        """Detect sky - usually top portion, light"""
        sky = np.zeros((height, width), dtype=bool)

        # Light blue/white at top
        lower_sky = np.array([90, 0, 150])
        upper_sky = np.array([130, 100, 255])
        light_sky = cv2.inRange(img_hsv, lower_sky, upper_sky)

        # Only consider top 30% of image
        sky[:int(height * 0.3), :] = light_sky[:int(height * 0.3), :] > 0

        return sky

    def _detect_water(self, img_hsv):
        """Detect water bodies"""
        # Blue hue
        lower_water = np.array([90, 50, 50])
        upper_water = np.array([130, 255, 200])
        water = cv2.inRange(img_hsv, lower_water, upper_water)

        return water > 0

    def _clean_mask(self, mask):
        """Remove small noise from mask"""
        # Remove small isolated regions
        kernel = np.ones((5, 5), np.uint8)
        cleaned = cv2.morphologyEx(mask.astype(np.uint8) * 255, cv2.MORPH_OPEN, kernel)

        # Fill small holes
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)

        return cleaned > 0


# Singleton instance
_segmentation_service = None


def get_segmentation_service():
    """Get segmentation service instance"""
    global _segmentation_service
    if _segmentation_service is None:
        _segmentation_service = SegmentationService()
    return _segmentation_service