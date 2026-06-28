"""
Save the trained model weights with correct extension
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models.pix2pix import Pix2PixModel

print("\n" + "="*60)
print("💾 SAVING TRAINED MODEL")
print("="*60)

# Create model
print("🎨 Loading model architecture...")
model = Pix2PixModel()

# Save with correct extension
weights_dir = Path("models/trained_weights")
weights_dir.mkdir(parents=True, exist_ok=True)

weights_path = weights_dir / "generator_final.weights.h5"

print(f"💾 Saving weights to: {weights_path}")
model.generator.save_weights(str(weights_path))

print("="*60)
print("✅ MODEL SAVED SUCCESSFULLY!")
print("="*60)
print(f"📁 Location: {weights_path}")
print(f"📊 File size: {weights_path.stat().st_size / 1024 / 1024:.2f} MB")
print("="*60)
print("\n✅ Ready to use! Restart backend to load trained model.\n")