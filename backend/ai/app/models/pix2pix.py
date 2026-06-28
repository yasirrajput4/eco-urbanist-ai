"""
Pix2Pix GAN Model with Smart Greenery Enhancement
Places visible vegetation icons on city layouts
"""
import logging
from pathlib import Path
import numpy as np
import tensorflow as tf
from PIL import Image
import cv2

from app.models.generator import build_generator
from app.models.discriminator import build_discriminator

logger = logging.getLogger(__name__)


class Pix2PixModel:
    """
    Pix2Pix GAN for image-to-image translation
    Enhanced with smart greenery placement using icon overlay
    """

    def __init__(self, img_size=256):
        """
        Initialize Pix2Pix model

        Args:
            img_size: Input image size (default: 256)
        """
        logger.info("🎨 Initializing Pix2Pix model...")

        self.img_size = img_size
        self.img_shape = (img_size, img_size, 3)
        self.model_trained = False
        self.original_size = None

        logger.info("🎨 Building Generator...")
        self.generator = build_generator(self.img_shape)

        logger.info("🎯 Building Discriminator...")
        self.discriminator = build_discriminator(self.img_shape)

        weights_path = Path("models/trained_weights/generator_final.weights.h5")
        old_weights_path = Path("models/trained_weights/generator_final.h5")

        if weights_path.exists():
            try:
                logger.info(f"📥 Loading trained weights...")
                self.generator.load_weights(str(weights_path))
                self.model_trained = True
                logger.info(f"✅ Loaded trained weights")
            except Exception as e:
                logger.warning(f"⚠️  Failed to load weights: {e}")
                self.model_trained = False
        elif old_weights_path.exists():
            try:
                logger.info(f"📥 Loading trained weights...")
                self.generator.load_weights(str(old_weights_path))
                self.model_trained = True
                logger.info(f"✅ Loaded trained weights")
            except Exception as e:
                logger.warning(f"⚠️  Failed to load weights: {e}")
                self.model_trained = False
        else:
            logger.info("🔧 Using smart icon-based enhancement")
            self.model_trained = False

        logger.info("✅ Pix2Pix model initialized!")

    def load_and_preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Load and preprocess image for model input

        Args:
            image_path: Path to input image

        Returns:
            Preprocessed image array
        """
        img = Image.open(image_path)

        if img.mode != 'RGB':
            img = img.convert('RGB')

        self.original_size = img.size

        img = img.resize((self.img_size, self.img_size), Image.Resampling.LANCZOS)

        img_array = np.array(img, dtype=np.float32)
        img_array = (img_array / 127.5) - 1.0

        img_array = np.expand_dims(img_array, axis=0)

        return img_array

    def generate(self, input_image: np.ndarray) -> np.ndarray:
        """
        Generate green city layout from input

        Args:
            input_image: Preprocessed input image (normalized to [-1, 1])

        Returns:
            Generated image array (RGB, 0-255)
        """
        from app.models.smart_greenery import get_smart_greenery_model

        input_img = ((input_image[0] + 1.0) * 127.5).astype(np.uint8)
        input_bgr = cv2.cvtColor(input_img, cv2.COLOR_RGB2BGR)

        logger.info("🌿 Applying smart greenery placement...")

        smart_model = get_smart_greenery_model()
        result_bgr, analysis = smart_model.add_greenery(
            input_bgr,
            density="ultra"  # MAXIMUM GREENERY MODE
        )

        result_rgb = cv2.cvtColor(result_bgr, cv2.COLOR_BGR2RGB)

        if hasattr(self, 'original_size') and self.original_size:
            width, height = self.original_size
            result_pil = Image.fromarray(result_rgb)
            result_pil = result_pil.resize((width, height), Image.Resampling.LANCZOS)
            result_rgb = np.array(result_pil)
            logger.info(f"📐 Resized output to: {width}x{height}")

        logger.info(f"✅ Placed {analysis['total_placed']} vegetation items:")
        logger.info(f"   🌳 Trees: {analysis['trees_placed']}")
        logger.info(f"   🌿 Bushes: {analysis['bushes_placed']}")
        logger.info(f"   🌱 Grass: {analysis['grass_placed']}")
        logger.info(f"📊 Green: {analysis['initial_green_pct']:.1f}% → {analysis['final_green_pct']:.1f}%")

        return result_rgb

    def predict(self, input_path: str, output_path: str) -> dict:
        """
        Generate prediction and save output

        Args:
            input_path: Path to input image
            output_path: Path to save output image

        Returns:
            Dictionary with prediction results
        """
        logger.info(f"🎨 Generating prediction for: {input_path}")

        input_image = self.load_and_preprocess_image(input_path)

        generated = self.generate(input_image)

        self.save_image(generated, output_path)

        logger.info(f"✅ Prediction saved to: {output_path}")

        return {
            "success": True,
            "input_path": input_path,
            "output_path": output_path,
            "model_trained": self.model_trained,
            "method": "Smart Icon-Based Greenery Placement"
        }

    def save_image(self, image_array: np.ndarray, output_path: str):
        """
        Save image array to file

        Args:
            image_array: Image array to save (RGB, 0-255)
            output_path: Path to save image
        """
        output_dir = Path(output_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)

        img = Image.fromarray(image_array.astype(np.uint8))
        img.save(output_path, quality=95)

        logger.info(f"💾 Image saved: {output_path}")

    def get_model_info(self) -> dict:
        """Get model information"""
        return {
            "model_name": "Pix2Pix + Smart Greenery",
            "img_size": self.img_size,
            "trained": self.model_trained,
            "generator_params": self.generator.count_params(),
            "discriminator_params": self.discriminator.count_params(),
            "method": "Smart Icon Placement"
        }


_pix2pix_model = None


def get_pix2pix_model(img_size=256):
    """Get or create Pix2Pix model instance (singleton)"""
    global _pix2pix_model

    if _pix2pix_model is None:
        _pix2pix_model = Pix2PixModel(img_size=img_size)

    return _pix2pix_model