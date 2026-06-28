"""
Image Processing Utilities
Functions for loading, preprocessing, and normalizing images
"""

import numpy as np
import cv2
from PIL import Image
import tensorflow as tf


def load_image(image_path, target_size=(256, 256)):
    """
    Load and resize an image from file path
    
    Args:
        image_path (str): Path to image file
        target_size (tuple): Target size (height, width)
    
    Returns:
        numpy.ndarray: Loaded and resized image (RGB)
    """
    # Load image using PIL
    img = Image.open(image_path)
    
    # Convert to RGB (in case of RGBA or grayscale)
    img = img.convert('RGB')
    
    # Resize to target size
    img = img.resize((target_size[1], target_size[0]), Image.LANCZOS)
    
    # Convert to numpy array
    img_array = np.array(img)
    
    return img_array


def normalize_image(image):
    """
    Normalize image to [-1, 1] range (for GAN input)
    
    Args:
        image (numpy.ndarray): Image array with values in [0, 255]
    
    Returns:
        numpy.ndarray: Normalized image with values in [-1, 1]
    """
    # Convert to float32
    image = image.astype(np.float32)
    
    # Normalize from [0, 255] to [-1, 1]
    normalized = (image / 127.5) - 1.0
    
    return normalized


def denormalize_image(image):
    """
    Denormalize image from [-1, 1] to [0, 255] range
    
    Args:
        image (numpy.ndarray): Normalized image with values in [-1, 1]
    
    Returns:
        numpy.ndarray: Denormalized image with values in [0, 255]
    """
    # Convert from [-1, 1] to [0, 255]
    denormalized = (image + 1.0) * 127.5
    
    # Clip values to valid range
    denormalized = np.clip(denormalized, 0, 255)
    
    # Convert to uint8
    denormalized = denormalized.astype(np.uint8)
    
    return denormalized


def preprocess_image_for_model(image_path, target_size=(256, 256)):
    """
    Complete preprocessing pipeline for model input
    
    Args:
        image_path (str): Path to image file
        target_size (tuple): Target size (height, width)
    
    Returns:
        tensorflow.Tensor: Preprocessed image ready for model (shape: [1, H, W, 3])
    """
    # Load and resize
    img = load_image(image_path, target_size)
    
    # Normalize to [-1, 1]
    img_normalized = normalize_image(img)
    
    # Add batch dimension and convert to tensor
    img_tensor = tf.convert_to_tensor(img_normalized[np.newaxis, ...], dtype=tf.float32)
    
    return img_tensor


def save_image(image_array, save_path):
    """
    Save image array to file
    
    Args:
        image_array (numpy.ndarray): Image array (can be normalized or denormalized)
        save_path (str): Path to save the image
    """
    # Check if image is normalized (values in [-1, 1])
    if image_array.min() < 0 or image_array.max() <= 1.0:
        image_array = denormalize_image(image_array)
    
    # Remove batch dimension if present
    if len(image_array.shape) == 4:
        image_array = image_array[0]
    
    # Convert to PIL Image and save
    img = Image.fromarray(image_array.astype(np.uint8))
    img.save(save_path)
    
    return save_path


def resize_image(image, target_size=(256, 256)):
    """
    Resize image using OpenCV
    
    Args:
        image (numpy.ndarray): Input image
        target_size (tuple): Target size (height, width)
    
    Returns:
        numpy.ndarray: Resized image
    """
    resized = cv2.resize(image, (target_size[1], target_size[0]), interpolation=cv2.INTER_LANCZOS4)
    return resized


def convert_rgb_to_bgr(image):
    """
    Convert RGB to BGR (for OpenCV compatibility)
    
    Args:
        image (numpy.ndarray): RGB image
    
    Returns:
        numpy.ndarray: BGR image
    """
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)


def convert_bgr_to_rgb(image):
    """
    Convert BGR to RGB
    
    Args:
        image (numpy.ndarray): BGR image
    
    Returns:
        numpy.ndarray: RGB image
    """
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


# Testing function
if __name__ == "__main__":
    print("=" * 60)
    print("Testing Image Processing Utilities")
    print("=" * 60)
    
    # Test normalization and denormalization
    print("\n🧪 Testing normalization...")
    test_image = np.random.randint(0, 256, (256, 256, 3), dtype=np.uint8)
    
    print(f"Original image range: [{test_image.min()}, {test_image.max()}]")
    
    # Normalize
    normalized = normalize_image(test_image)
    print(f"Normalized range: [{normalized.min():.3f}, {normalized.max():.3f}]")
    
    # Denormalize
    denormalized = denormalize_image(normalized)
    print(f"Denormalized range: [{denormalized.min()}, {denormalized.max()}]")
    
    # Check if denormalization recovers original
    difference = np.abs(test_image.astype(float) - denormalized.astype(float)).mean()
    print(f"Mean difference after round-trip: {difference:.6f}")
    
    # Test resize
    print("\n🧪 Testing resize...")
    original_shape = test_image.shape
    resized = resize_image(test_image, target_size=(128, 128))
    print(f"Original shape: {original_shape}")
    print(f"Resized shape: {resized.shape}")
    
    # Test color conversion
    print("\n🧪 Testing color conversion...")
    bgr = convert_rgb_to_bgr(test_image)
    rgb_back = convert_bgr_to_rgb(bgr)
    conversion_diff = np.abs(test_image.astype(float) - rgb_back.astype(float)).mean()
    print(f"Color conversion round-trip difference: {conversion_diff:.6f}")
    
    print("\n" + "=" * 60)
    print("✅ All image processing utilities working!")
    print("=" * 60)