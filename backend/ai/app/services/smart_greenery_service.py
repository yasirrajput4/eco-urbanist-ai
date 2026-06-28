"""
Smart Greenery Enhancement
Uses semantic segmentation to add realistic greenery
CORRECTED VERSION - Proper masking logic
"""
import cv2
import numpy as np
import logging
from app.services.segmentation_service import get_segmentation_service

logger = logging.getLogger(__name__)


class SmartGreeneryEnhancer:
    """
    Intelligent greenery enhancement using semantic segmentation
    Adds trees and green spaces only to available areas
    PRESERVES buildings, roads, and vehicles
    """

    def __init__(self):
        self.segmentation_service = get_segmentation_service()
        logger.info("🌿 Smart Greenery Enhancer initialized")

    def enhance_with_segmentation(self, input_path: str, output_path: str) -> dict:
        """
        Enhance image with intelligent greenery placement

        Args:
            input_path: Path to input image
            output_path: Path to save enhanced image

        Returns:
            dict: Enhancement results with statistics
        """
        logger.info("=" * 60)
        logger.info("🌳 SMART GREENERY ENHANCEMENT")
        logger.info("=" * 60)

        # Load original image
        img = cv2.imread(input_path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        height, width = img.shape[:2]

        # Segment image
        logger.info("🎨 Performing semantic segmentation...")
        masks = self.segmentation_service.segment_image(input_path)

        # Create output starting with original image
        output = img_rgb.copy()

        # ONLY modify available spaces (not buildings/roads)
        logger.info("🌱 Adding greenery to available spaces...")

        # Get available space coordinates
        available_coords = np.where(masks['available'])
        available_count = len(available_coords[0])

        logger.info(f"   Found {available_count} available pixels for greenery")

        if available_count > 0:
            # Add grass to available areas
            output = self._add_grass_texture(output, masks['available'])

            # Add tree clusters to larger empty areas
            logger.info("🌳 Planting tree clusters...")
            output = self._add_smart_trees(output, masks['available'])

            # Smooth transitions
            output = self._smooth_boundaries(output, img_rgb, masks['available'])
        else:
            logger.warning("⚠️  No available space found for greenery!")

        # Save result
        output_bgr = cv2.cvtColor(output, cv2.COLOR_RGB2BGR)
        cv2.imwrite(output_path, output_bgr)

        # Calculate statistics
        total_pixels = height * width
        available_pixels = np.sum(masks['available'])
        building_pixels = np.sum(masks['buildings'])
        road_pixels = np.sum(masks['roads'])
        tree_pixels = np.sum(masks['trees'])

        stats = {
            "total_pixels": int(total_pixels),
            "buildings_pct": float(building_pixels / total_pixels * 100),
            "roads_pct": float(road_pixels / total_pixels * 100),
            "existing_trees_pct": float(tree_pixels / total_pixels * 100),
            "available_space_pct": float(available_pixels / total_pixels * 100),
            "greenery_added_pct": float(available_pixels / total_pixels * 100)
        }

        logger.info("✅ Enhancement complete!")
        logger.info(f"   Buildings preserved: {stats['buildings_pct']:.1f}%")
        logger.info(f"   Roads preserved: {stats['roads_pct']:.1f}%")
        logger.info(f"   Existing trees kept: {stats['existing_trees_pct']:.1f}%")
        logger.info(f"   Greenery added to: {stats['greenery_added_pct']:.1f}%")
        logger.info("=" * 60)

        return {
            "success": True,
            "input_path": input_path,
            "output_path": output_path,
            "statistics": stats,
            "method": "AI Semantic Segmentation + Smart Greenery"
        }

    def _add_grass_texture(self, img, available_mask):
        """
        Add realistic grass texture ONLY to available areas
        """
        output = img.copy()

        # Grass color palette
        grass_shades = [
            [34, 139, 34],   # Forest green
            [50, 205, 50],   # Lime green
            [46, 139, 87],   # Sea green
            [60, 179, 113],  # Medium sea green
            [107, 142, 35],  # Olive drab
        ]

        # Create grass texture
        height, width = img.shape[:2]
        grass_texture = np.zeros((height, width, 3), dtype=np.uint8)

        # Fill with varied green
        for i in range(height):
            for j in range(width):
                if available_mask[i, j]:  # Only process available pixels
                    # Choose shade based on position
                    shade_idx = (i + j) % len(grass_shades)
                    base_color = grass_shades[shade_idx]

                    # Add natural variation
                    noise = np.random.randint(-20, 20, 3)
                    color = np.clip(np.array(base_color) + noise, 0, 255)

                    grass_texture[i, j] = color

        # Apply grass texture ONLY to available areas
        mask_3ch = np.stack([available_mask] * 3, axis=-1)
        output = np.where(mask_3ch, grass_texture, output)

        return output.astype(np.uint8)

    def _add_smart_trees(self, img, available_mask):
        """
        Add tree clusters intelligently to larger open areas
        """
        output = img.copy()

        # Find contours of available spaces
        available_uint8 = available_mask.astype(np.uint8) * 255
        contours, _ = cv2.findContours(
            available_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        if len(contours) == 0:
            return output

        # Sort by area (plant trees in largest open spaces first)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)

        # Process top 15 largest areas
        num_areas = min(15, len(contours))

        for i in range(num_areas):
            contour = contours[i]
            area = cv2.contourArea(contour)

            # Only add trees to reasonably sized areas
            if area < 100:  # Skip tiny areas
                continue

            if area > 10000:  # Very large area - many trees
                num_trees = 20
            elif area > 2000:  # Medium area
                num_trees = 10
            elif area > 500:  # Small area
                num_trees = 5
            else:
                num_trees = 2

            # Get bounding box
            x, y, w, h = cv2.boundingRect(contour)

            # Plant trees randomly within this contour
            for _ in range(num_trees):
                # Random position within bounding box
                attempts = 0
                while attempts < 10:  # Try 10 times to find valid spot
                    tx = x + np.random.randint(0, max(1, w))
                    ty = y + np.random.randint(0, max(1, h))

                    # Check bounds
                    if ty >= output.shape[0] or tx >= output.shape[1]:
                        attempts += 1
                        continue

                    # Check if actually available
                    if available_mask[ty, tx]:
                        # Plant tree
                        radius = np.random.randint(10, 30)
                        tree_color = [
                            np.random.randint(15, 25),   # R
                            np.random.randint(70, 100),  # G
                            np.random.randint(15, 25)    # B
                        ]

                        # Draw tree circle
                        y_min = max(0, ty - radius)
                        y_max = min(output.shape[0], ty + radius)
                        x_min = max(0, tx - radius)
                        x_max = min(output.shape[1], tx + radius)

                        for py in range(y_min, y_max):
                            for px in range(x_min, x_max):
                                dist = np.sqrt((px - tx)**2 + (py - ty)**2)
                                if dist <= radius and available_mask[py, px]:
                                    # Add some variation to tree color
                                    variation = np.random.randint(-10, 10, 3)
                                    final_color = np.clip(
                                        np.array(tree_color) + variation, 0, 255
                                    )
                                    output[py, px] = final_color

                        break

                    attempts += 1

        return output

    def _smooth_boundaries(self, enhanced, original, available_mask):
        """
        Smooth boundaries between greenery and original structures
        """
        # Blur the enhanced version slightly
        enhanced_blur = cv2.GaussianBlur(enhanced, (5, 5), 0)

        # Create 3-channel mask
        mask_3ch = np.stack([available_mask] * 3, axis=-1)

        # Use blurred enhanced for available areas, original for everything else
        output = np.where(mask_3ch, enhanced_blur, original)

        return output.astype(np.uint8)


# Singleton
_smart_greenery_enhancer = None


def get_smart_greenery_enhancer():
    """Get smart greenery enhancer instance"""
    global _smart_greenery_enhancer
    if _smart_greenery_enhancer is None:
        _smart_greenery_enhancer = SmartGreeneryEnhancer()
    return _smart_greenery_enhancer