"""
Prediction Service
Handles image prediction using:
1. Semantic Segmentation (DeepLabV3+) for real photos
2. Demo Enhancement for building masks
3. Pix2Pix model (when trained)
"""
import os
import logging
from pathlib import Path
from datetime import datetime
import uuid
import cv2
import numpy as np

from app.models.pix2pix import get_pix2pix_model
from app.services.green_score_service import calculate_green_score

# Smart greenery enhancement with segmentation
try:
    from app.services.smart_greenery_service import get_smart_greenery_enhancer
    USE_SMART_ENHANCEMENT = True
    logging.info("✅ Smart greenery enhancement (segmentation) available")
except ImportError:
    USE_SMART_ENHANCEMENT = False
    logging.info("⚠️  Smart enhancement not available")

# Demo enhancement mode (fallback)
try:
    from app.services.demo_enhancement import get_enhancer
    USE_DEMO_ENHANCEMENT = True
    logging.info("✅ Demo enhancement mode available")
except ImportError:
    USE_DEMO_ENHANCEMENT = False
    logging.info("⚠️  Demo enhancement not available")

logger = logging.getLogger(__name__)


class PredictionService:
    """
    Service for generating predictions from input images
    Automatically selects best enhancement method based on input type
    """

    def __init__(self):
        """Initialize prediction service"""
        logger.info("Initializing Prediction Service...")

        # Setup directories
        self.base_dir = Path(__file__).parent.parent.parent
        self.upload_dir = self.base_dir / "data" / "uploads"
        self.output_dir = self.base_dir / "data" / "output"

        # Create directories if they don't exist
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Upload directory: {self.upload_dir}")
        logger.info(f"Output directory: {self.output_dir}")

        # Load model
        self.model = None
        try:
            self.model = get_pix2pix_model()
            logger.info("✅ Pix2Pix model loaded")
        except Exception as e:
            logger.warning(f"⚠️  Could not load Pix2Pix model: {e}")
            logger.info("Will use enhancement methods")

        logger.info("✅ Prediction Service initialized successfully!")

    def _detect_image_type(self, image_path: str) -> str:
        """
        Detect if image is a building mask or real photo

        Args:
            image_path: Path to image

        Returns:
            str: 'mask' or 'photo'
        """
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

        if img is None:
            return 'photo'  # Default to photo

        # Calculate black/white ratio
        black_pixels = np.sum(img < 30)
        white_pixels = np.sum(img > 225)
        total_pixels = img.size
        bw_ratio = (black_pixels + white_pixels) / total_pixels

        # If >70% is pure black or white, it's a mask
        if bw_ratio > 0.7:
            return 'mask'
        else:
            return 'photo'

    def generate_prediction(self, input_image_path: str) -> dict:
        """
        Generate prediction from input image
        Automatically selects best method based on image type and available models

        Args:
            input_image_path: Path to input image file

        Returns:
            dict: Prediction results containing:
                - output_filename: Name of generated image
                - output_path: Full path to generated image
                - green_scores: Green coverage metrics
                - metadata: Processing information
        """
        logger.info("=" * 60)
        logger.info("🎨 STARTING PREDICTION GENERATION")
        logger.info("=" * 60)
        logger.info(f"📥 Input image: {input_image_path}")

        # Verify input file exists
        if not os.path.exists(input_image_path):
            raise FileNotFoundError(f"Input image not found: {input_image_path}")

        # Detect image type
        image_type = self._detect_image_type(input_image_path)
        logger.info(f"🔍 Image type detected: {image_type.upper()}")

        # Generate output filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = uuid.uuid4().hex[:8]
        output_filename = f"generated_{timestamp}_{unique_id}.png"
        output_path = self.output_dir / output_filename

        logger.info(f"📤 Output will be saved to: {output_path}")

        # Decide which method to use
        processing_method = "Unknown"
        use_smart_segmentation = False
        use_demo = False
        use_model = False

        # Decision tree for method selection
        if self.model and self.model.model_trained:
            # If model is trained, always use it
            use_model = True
            processing_method = "Pix2Pix GAN (Trained)"
            logger.info("🤖 Using trained Pix2Pix model")
        elif image_type == 'photo' and USE_SMART_ENHANCEMENT:
            # Real photo + smart enhancement available
            use_smart_segmentation = True
            processing_method = "AI Semantic Segmentation + Smart Greenery"
            logger.info("🧠 Using AI Semantic Segmentation for real photo")
        elif USE_DEMO_ENHANCEMENT:
            # Fallback to demo enhancement
            use_demo = True
            processing_method = "Smart Enhancement"
            logger.info("🌿 Using demo enhancement")
        else:
            raise RuntimeError("No enhancement method available!")

        # Execute chosen method
        try:
            if use_model:
                self._generate_with_model(input_image_path, str(output_path))
            elif use_smart_segmentation:
                self._generate_with_segmentation(input_image_path, str(output_path))
            elif use_demo:
                self._generate_with_demo(input_image_path, str(output_path))
        except Exception as e:
            logger.error(f"❌ Primary method failed: {e}")

            # Fallback chain
            if use_smart_segmentation and USE_DEMO_ENHANCEMENT:
                logger.info("⚠️  Falling back to demo enhancement...")
                self._generate_with_demo(input_image_path, str(output_path))
                processing_method = "Smart Enhancement (Fallback)"
            else:
                raise

        # Calculate green scores
        logger.info("📊 Calculating green coverage scores...")
        try:
            green_scores = self._calculate_green_scores(input_image_path, str(output_path))
            logger.info(f"   Input green score: {green_scores['input']['green_score']:.2f}%")
            logger.info(f"   Output green score: {green_scores['output']['green_score']:.2f}%")
            # 🔧 FIX: removed the literal "+" before the value. The format
            # spec ":+.2f" already adds a sign (+ for positive, - for
            # negative). Combining both produced "+-3.45%" whenever the
            # output had less green coverage than the input.
            logger.info(f"   Improvement: {green_scores['improvement']:+.2f}%")
        except Exception as e:
            logger.error(f"❌ Green score calculation failed: {e}")
            green_scores = {
                "input": {"green_score": 0, "green_pixels": 0, "total_pixels": 0},
                "output": {"green_score": 0, "green_pixels": 0, "total_pixels": 0},
                "improvement": 0
            }

        # Prepare result
        result = {
            "output_filename": output_filename,
            "output_path": str(output_path),
            "green_scores": green_scores,
            "metadata": {
                "model_trained": self.model.model_trained if self.model else False,
                "processing_method": processing_method,
                "image_type": image_type,
                "timestamp": datetime.now().isoformat(),
                "input_image": input_image_path,
                "output_image": str(output_path)
            }
        }

        logger.info("=" * 60)
        logger.info("✅ PREDICTION COMPLETED SUCCESSFULLY!")
        logger.info(f"   Method: {processing_method}")
        # 🔧 FIX: same double-sign issue as above — let ":+.2f" supply the
        # sign instead of hardcoding "+".
        logger.info(f"   Green Improvement: {green_scores['improvement']:+.2f}%")
        logger.info("=" * 60)

        return result

    def _generate_with_model(self, input_path: str, output_path: str):
        """Generate using Pix2Pix GAN model"""
        logger.info("🤖 Generating with Pix2Pix model...")

        # Load and preprocess
        input_image = self.model.load_and_preprocess_image(input_path)

        # Generate
        generated_image = self.model.generate(input_image)

        # Save
        self.model.save_image(generated_image, output_path)

        logger.info("✅ Model generation complete!")

    def _generate_with_segmentation(self, input_path: str, output_path: str):
        """Generate using semantic segmentation + smart greenery"""
        logger.info("🧠 Generating with AI Segmentation...")

        smart_enhancer = get_smart_greenery_enhancer()
        result = smart_enhancer.enhance_with_segmentation(input_path, output_path)

        logger.info("✅ Segmentation-based enhancement complete!")
        return result

    def _generate_with_demo(self, input_path: str, output_path: str):
        """Generate using demo enhancement"""
        logger.info("🌿 Generating with demo enhancement...")

        enhancer = get_enhancer()
        result = enhancer.enhance_image(input_path, output_path)

        logger.info("✅ Demo enhancement complete!")
        return result

    def _calculate_green_scores(self, input_path: str, output_path: str) -> dict:
        """
        Calculate green coverage scores for input and output images

        Args:
            input_path: Path to input image
            output_path: Path to output image

        Returns:
            dict: Green score metrics for both images and improvement
        """
        logger.info("Calculating green scores...")

        try:
            # Calculate for input image
            input_score_data = calculate_green_score(input_path)
            input_score = input_score_data["green_score"]
            input_pixels = input_score_data["green_pixels"]
            input_total = input_score_data["total_pixels"]

            logger.info(f"Input - Green: {input_score:.2f}%, Pixels: {input_pixels}/{input_total}")

            # Calculate for output image
            output_score_data = calculate_green_score(output_path)
            output_score = output_score_data["green_score"]
            output_pixels = output_score_data["green_pixels"]
            output_total = output_score_data["total_pixels"]

            logger.info(f"Output - Green: {output_score:.2f}%, Pixels: {output_pixels}/{output_total}")

            # Calculate improvement
            improvement = output_score - input_score

            logger.info(f"Improvement: +{improvement:.2f}%")

            return {
                "input": {
                    "green_score": round(input_score, 2),
                    "green_pixels": int(input_pixels),
                    "total_pixels": int(input_total)
                },
                "output": {
                    "green_score": round(output_score, 2),
                    "green_pixels": int(output_pixels),
                    "total_pixels": int(output_total)
                },
                "improvement": round(improvement, 2)
            }

        except Exception as e:
            logger.error(f"Error calculating green scores: {e}")
            raise


# Singleton instance
_prediction_service = None


def get_prediction_service():
    """
    Get or create prediction service instance (Singleton pattern)

    Returns:
        PredictionService: Prediction service instance
    """
    global _prediction_service

    if _prediction_service is None:
        logger.info("Creating new Prediction Service instance...")
        _prediction_service = PredictionService()

    return _prediction_service