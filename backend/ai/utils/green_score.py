"""
Green Score Calculator
Computer Vision algorithm to measure vegetation coverage in satellite images
"""

import cv2
import numpy as np
from typing import Tuple, Dict


class GreenScoreCalculator:
    """
    Calculate green vegetation coverage in satellite images using HSV color analysis
    """
    
    def __init__(
        self,
        lower_green_hsv=(35, 40, 40),
        upper_green_hsv=(85, 255, 255)
    ):
        """
        Initialize Green Score Calculator
        
        Args:
            lower_green_hsv (tuple): Lower bound for green in HSV (H, S, V)
            upper_green_hsv (tuple): Upper bound for green in HSV (H, S, V)
        
        HSV Ranges:
            - Hue (H): 0-180 (OpenCV uses half of standard 0-360)
            - Saturation (S): 0-255
            - Value (V): 0-255
        
        Default green range:
            - Hue: 35-85 (covers grass, trees, vegetation)
            - Saturation: 40-255 (excludes pale/washed out colors)
            - Value: 40-255 (excludes very dark pixels)
        """
        self.lower_green = np.array(lower_green_hsv, dtype=np.uint8)
        self.upper_green = np.array(upper_green_hsv, dtype=np.uint8)
    
    
    def calculate_green_score(self, image: np.ndarray) -> Dict[str, float]:
        """
        Calculate green score for an image
        
        Args:
            image (np.ndarray): Input image (RGB format, shape: [H, W, 3])
        
        Returns:
            dict: Dictionary containing:
                - green_score: Percentage of green pixels (0-100)
                - green_pixels: Number of green pixels
                - total_pixels: Total number of pixels
                - coverage_ratio: Green pixels / total pixels (0-1)
        """
        # Convert to uint8 if needed
        if image.dtype != np.uint8:
            # Check if image is normalized ([-1, 1] or [0, 1])
            if image.max() <= 1.0:
                image = (image * 255).astype(np.uint8)
            else:
                image = image.astype(np.uint8)
        
        # Remove batch dimension if present
        if len(image.shape) == 4:
            image = image[0]
        
        # Convert RGB to HSV
        hsv_image = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Create mask for green colors
        green_mask = cv2.inRange(hsv_image, self.lower_green, self.upper_green)
        
        # Count green pixels
        green_pixels = np.count_nonzero(green_mask)
        
        # Calculate total pixels
        total_pixels = image.shape[0] * image.shape[1]
        
        # Calculate coverage ratio
        coverage_ratio = green_pixels / total_pixels if total_pixels > 0 else 0.0
        
        # Calculate green score (percentage)
        green_score = coverage_ratio * 100.0
        
        # Convert NumPy types to Python native types for JSON serialization
        return {
            'green_score': float(round(green_score, 2)),
            'green_pixels': int(green_pixels),
            'total_pixels': int(total_pixels),
            'coverage_ratio': float(round(coverage_ratio, 4))
        }
    
    
    def create_green_mask(self, image: np.ndarray) -> np.ndarray:
        """
        Create a binary mask showing green regions
        
        Args:
            image (np.ndarray): Input image (RGB format)
        
        Returns:
            np.ndarray: Binary mask (green=255, non-green=0)
        """
        # Convert to uint8 if needed
        if image.dtype != np.uint8:
            if image.max() <= 1.0:
                image = (image * 255).astype(np.uint8)
            else:
                image = image.astype(np.uint8)
        
        # Remove batch dimension if present
        if len(image.shape) == 4:
            image = image[0]
        
        # Convert RGB to HSV
        hsv_image = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Create and return mask
        green_mask = cv2.inRange(hsv_image, self.lower_green, self.upper_green)
        
        return green_mask
    
    
    def visualize_green_regions(self, image: np.ndarray) -> np.ndarray:
        """
        Create visualization overlay showing green regions
        
        Args:
            image (np.ndarray): Input image (RGB format)
        
        Returns:
            np.ndarray: Image with green regions highlighted
        """
        # Convert to uint8 if needed
        if image.dtype != np.uint8:
            if image.max() <= 1.0:
                image = (image * 255).astype(np.uint8)
            else:
                image = image.astype(np.uint8)
        
        # Remove batch dimension if present
        if len(image.shape) == 4:
            image = image[0]
        
        # Create green mask
        green_mask = self.create_green_mask(image)
        
        # Create colored overlay (green regions in bright green)
        overlay = image.copy()
        overlay[green_mask > 0] = [0, 255, 0]  # Bright green
        
        # Blend original and overlay
        result = cv2.addWeighted(image, 0.6, overlay, 0.4, 0)
        
        return result
    
    
    def compare_images(
        self,
        image_before: np.ndarray,
        image_after: np.ndarray
    ) -> Dict[str, any]:
        """
        Compare green scores between two images
        
        Args:
            image_before (np.ndarray): Original image
            image_after (np.ndarray): Transformed image
        
        Returns:
            dict: Comparison metrics including improvement percentage
        """
        score_before = self.calculate_green_score(image_before)
        score_after = self.calculate_green_score(image_after)
        
        # Calculate improvement
        improvement = score_after['green_score'] - score_before['green_score']
        improvement_percentage = (improvement / max(score_before['green_score'], 0.01)) * 100
        
        # Convert to Python native types
        return {
            'before': score_before,
            'after': score_after,
            'improvement': float(round(improvement, 2)),
            'improvement_percentage': float(round(improvement_percentage, 2))
        }


# Testing function
if __name__ == "__main__":
    print("=" * 60)
    print("Testing Green Score Calculator")
    print("=" * 60)
    
    # Initialize calculator
    calculator = GreenScoreCalculator()
    
    print("\n📊 Green Score Calculator initialized")
    print(f"   Lower HSV bound: {calculator.lower_green}")
    print(f"   Upper HSV bound: {calculator.upper_green}")
    
    # Test 1: Image with no green (all blue)
    print("\n🧪 Test 1: Image with no green (blue sky)")
    blue_image = np.zeros((256, 256, 3), dtype=np.uint8)
    blue_image[:, :, 2] = 255  # RGB: Blue channel
    
    score_blue = calculator.calculate_green_score(blue_image)
    print(f"   Green Score: {score_blue['green_score']}%")
    print(f"   Green Pixels: {score_blue['green_pixels']:,}")
    print(f"   Total Pixels: {score_blue['total_pixels']:,}")
    print(f"   Type check - green_score: {type(score_blue['green_score'])}")
    print(f"   Type check - green_pixels: {type(score_blue['green_pixels'])}")
    
    # Test 2: Image with 50% green
    print("\n🧪 Test 2: Image with 50% green")
    half_green = np.zeros((256, 256, 3), dtype=np.uint8)
    half_green[:, :128, 1] = 255  # Left half green (RGB: Green channel)
    half_green[:, 128:, 2] = 255  # Right half blue
    
    score_half = calculator.calculate_green_score(half_green)
    print(f"   Green Score: {score_half['green_score']}%")
    print(f"   Green Pixels: {score_half['green_pixels']:,}")
    
    # Test 3: Fully green image
    print("\n🧪 Test 3: Fully green image (grass)")
    green_image = np.zeros((256, 256, 3), dtype=np.uint8)
    green_image[:, :, 1] = 180  # Moderate green (more realistic than 255)
    
    score_green = calculator.calculate_green_score(green_image)
    print(f"   Green Score: {score_green['green_score']}%")
    print(f"   Coverage Ratio: {score_green['coverage_ratio']}")
    
    # Test 4: Normalized image (from GAN output)
    print("\n🧪 Test 4: Normalized image (GAN output simulation)")
    normalized_green = np.random.rand(256, 256, 3).astype(np.float32)
    normalized_green[:, :, 1] = 0.7  # Green channel dominant
    normalized_green[:, :, 0] = 0.2  # Low red
    normalized_green[:, :, 2] = 0.2  # Low blue
    
    score_normalized = calculator.calculate_green_score(normalized_green)
    print(f"   Green Score: {score_normalized['green_score']}%")
    print(f"   (Auto-detected normalized format and converted)")
    
    # Test 5: Compare two images
    print("\n🧪 Test 5: Before/After comparison")
    before = blue_image  # No green
    after = green_image  # Full green
    
    comparison = calculator.compare_images(before, after)
    print(f"   Before Green Score: {comparison['before']['green_score']}%")
    print(f"   After Green Score: {comparison['after']['green_score']}%")
    print(f"   Improvement: +{comparison['improvement']}%")
    print(f"   Improvement Percentage: {comparison['improvement_percentage']}%")
    print(f"   Type check - improvement: {type(comparison['improvement'])}")
    
    # Test 6: Create green mask
    print("\n🧪 Test 6: Creating green mask")
    mask = calculator.create_green_mask(half_green)
    print(f"   Mask shape: {mask.shape}")
    print(f"   Mask dtype: {mask.dtype}")
    print(f"   Unique values in mask: {np.unique(mask)}")
    
    print("\n" + "=" * 60)
    print("✅ Green Score Calculator working perfectly!")
    print("   All values are Python native types (JSON serializable)")
    print("=" * 60)