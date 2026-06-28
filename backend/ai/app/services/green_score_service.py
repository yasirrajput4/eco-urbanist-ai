"""
Green Score Service
Calculate green coverage percentage in images using HSV color analysis
"""
import cv2
import numpy as np
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def calculate_green_score(image_path: str) -> dict:
    """
    Calculate green coverage percentage in an image

    Uses HSV color space to detect green pixels:
    - Hue: 35-85 (green range)
    - Saturation: 40-255 (avoid white/gray)
    - Value: 40-255 (avoid black)

    Args:
        image_path: Path to the image file

    Returns:
        dict: Contains:
            - green_score: Percentage of green pixels (0-100)
            - green_pixels: Number of green pixels
            - total_pixels: Total number of pixels
            - image_size: Image dimensions (width, height)
    """
    logger.info(f"Calculating green score for: {image_path}")

    # Load image
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(f"Could not load image: {image_path}")

    # Get image dimensions
    height, width = image.shape[:2]
    total_pixels = height * width

    logger.info(f"Image size: {width}x{height} ({total_pixels} pixels)")

    # Convert BGR to HSV color space
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define range for green color in HSV
    # Green hue is typically 35-85 in OpenCV (0-179 scale)
    lower_green = np.array([35, 40, 40])   # Lower bound: dark green
    upper_green = np.array([85, 255, 255]) # Upper bound: bright green

    # Create mask for green pixels
    green_mask = cv2.inRange(hsv, lower_green, upper_green)

    # Count green pixels
    green_pixels = np.count_nonzero(green_mask)

    # Calculate percentage
    green_percentage = (green_pixels / total_pixels) * 100

    logger.info(f"Green pixels: {green_pixels}/{total_pixels} ({green_percentage:.2f}%)")

    return {
        "green_score": float(green_percentage),
        "green_pixels": int(green_pixels),
        "total_pixels": int(total_pixels),
        "image_size": {
            "width": int(width),
            "height": int(height)
        }
    }


def calculate_green_improvement(input_path: str, output_path: str) -> dict:
    """
    Calculate green improvement between input and output images

    Args:
        input_path: Path to input/original image
        output_path: Path to output/generated image

    Returns:
        dict: Contains scores for both images and improvement metrics
    """
    logger.info("Calculating green improvement...")

    # Calculate scores
    input_score_data = calculate_green_score(input_path)
    output_score_data = calculate_green_score(output_path)

    # Calculate improvement
    improvement = output_score_data["green_score"] - input_score_data["green_score"]
    improvement_percentage = (improvement / max(input_score_data["green_score"], 0.01)) * 100

    logger.info(f"Improvement: {improvement:+.2f}% ({improvement_percentage:+.1f}% relative)")

    return {
        "input": input_score_data,
        "output": output_score_data,
        "improvement": {
            "absolute": float(improvement),
            "relative_percentage": float(improvement_percentage)
        }
    }


def get_green_rating(green_score: float) -> dict:
    """
    Get rating category based on green score percentage

    Args:
        green_score: Green coverage percentage (0-100)

    Returns:
        dict: Rating information with category, color, and message
    """
    if green_score >= 60:
        return {
            "rating": "Excellent",
            "color": "green",
            "emoji": "🌳",
            "message": "Outstanding green coverage! Very sustainable."
        }
    elif green_score >= 40:
        return {
            "rating": "Good",
            "color": "lightgreen",
            "emoji": "🌿",
            "message": "Good green coverage. Room for improvement."
        }
    elif green_score >= 20:
        return {
            "rating": "Fair",
            "color": "orange",
            "emoji": "🌱",
            "message": "Moderate green coverage. Needs more greenery."
        }
    else:
        return {
            "rating": "Needs Improvement",
            "color": "red",
            "emoji": "⚠️",
            "message": "Low green coverage. Significant improvement needed."
        }


def analyze_image_greenery(image_path: str) -> dict:
    """
    Complete greenery analysis with score, rating, and recommendations

    Args:
        image_path: Path to the image file

    Returns:
        dict: Complete analysis including score, rating, and details
    """
    logger.info(f"Performing complete greenery analysis: {image_path}")

    # Calculate green score
    score_data = calculate_green_score(image_path)
    green_score = score_data["green_score"]

    # Get rating
    rating = get_green_rating(green_score)

    # Combine results
    analysis = {
        "green_score": green_score,
        "green_pixels": score_data["green_pixels"],
        "total_pixels": score_data["total_pixels"],
        "image_size": score_data["image_size"],
        "rating": rating["rating"],
        "rating_emoji": rating["emoji"],
        "rating_color": rating["color"],
        "message": rating["message"],
        "timestamp": Path(image_path).stat().st_mtime
    }

    logger.info(f"Analysis complete: {green_score:.2f}% - {rating['rating']}")

    return analysis


# Example usage and testing
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) > 1:
        # Test with provided image
        image_path = sys.argv[1]

        print("\n" + "="*60)
        print("GREEN SCORE ANALYSIS")
        print("="*60)

        analysis = analyze_image_greenery(image_path)

        print(f"\n📊 Results for: {image_path}")
        print(f"   Green Score: {analysis['green_score']:.2f}%")
        print(f"   Green Pixels: {analysis['green_pixels']:,}")
        print(f"   Total Pixels: {analysis['total_pixels']:,}")
        print(f"   Rating: {analysis['rating_emoji']} {analysis['rating']}")
        print(f"   {analysis['message']}")
        print("="*60 + "\n")
    else:
        print("Usage: python green_score_service.py <image_path>")