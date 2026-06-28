"""
Prepare DeepGlobe dataset for Pix2Pix training
Creates paired images: satellite | mask
"""
import cv2
import numpy as np
from pathlib import Path
import shutil
from tqdm import tqdm

print("\n" + "="*60)
print("🔧 PREPARING DEEPGLOBE FOR TRAINING")
print("="*60)

# Configuration
INPUT_DIR = Path("data/deepglobe/train")
OUTPUT_DIR = Path("data/training/deepglobe_prepared")
IMG_SIZE = 256
TRAIN_SPLIT = 0.8

# Create output directories
train_dir = OUTPUT_DIR / "train"
val_dir = OUTPUT_DIR / "val"
train_dir.mkdir(parents=True, exist_ok=True)
val_dir.mkdir(parents=True, exist_ok=True)

print(f"\n📁 Input: {INPUT_DIR}")
print(f"📁 Output: {OUTPUT_DIR}")
print(f"🖼️  Target size: {IMG_SIZE}x{IMG_SIZE}")
print(f"✂️  Train/Val split: {int(TRAIN_SPLIT*100)}%/{int((1-TRAIN_SPLIT)*100)}%")

# Get all satellite images
sat_images = sorted(list(INPUT_DIR.glob("*_sat.jpg")))
print(f"\n📊 Found {len(sat_images)} image pairs")

# Calculate split
split_idx = int(len(sat_images) * TRAIN_SPLIT)
train_images = sat_images[:split_idx]
val_images = sat_images[split_idx:]

print(f"📊 Train: {len(train_images)} pairs")
print(f"📊 Val: {len(val_images)} pairs")

def process_image_pair(sat_path, output_dir, index):
    """Process one satellite-mask pair"""
    # Get mask path
    mask_path = sat_path.parent / sat_path.name.replace("_sat.jpg", "_mask.png")
    
    if not mask_path.exists():
        return False
    
    # Load images
    sat_img = cv2.imread(str(sat_path))
    mask_img = cv2.imread(str(mask_path))
    
    if sat_img is None or mask_img is None:
        return False
    
    # Resize
    sat_resized = cv2.resize(sat_img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_LANCZOS4)
    mask_resized = cv2.resize(mask_img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_NEAREST)
    
    # Combine side-by-side: satellite | mask
    combined = np.hstack([sat_resized, mask_resized])
    
    # Save
    output_path = output_dir / f"{index:04d}.jpg"
    cv2.imwrite(str(output_path), combined, [cv2.IMWRITE_JPEG_QUALITY, 95])
    
    return True

# Process training set
print("\n🔄 Processing training images...")
success_count = 0
for i, sat_path in enumerate(tqdm(train_images, desc="Train")):
    if process_image_pair(sat_path, train_dir, i):
        success_count += 1

print(f"✅ Processed {success_count}/{len(train_images)} training pairs")

# Process validation set
print("\n🔄 Processing validation images...")
success_count = 0
for i, sat_path in enumerate(tqdm(val_images, desc="Val")):
    if process_image_pair(sat_path, val_dir, i):
        success_count += 1

print(f"✅ Processed {success_count}/{len(val_images)} validation pairs")

# Summary
train_count = len(list(train_dir.glob("*.jpg")))
val_count = len(list(val_dir.glob("*.jpg")))

print("\n" + "="*60)
print("🎉 DATA PREPARATION COMPLETE!")
print("="*60)
print(f"📁 Output directory: {OUTPUT_DIR}")
print(f"🖼️  Training images: {train_count}")
print(f"🖼️  Validation images: {val_count}")
print(f"💾 Total size: ~{(train_count + val_count) * 0.5:.0f} MB")
print("="*60)
print("\n✅ Ready for training!")
print("   Next: python scripts/train_deepglobe.py")
print("="*60 + "\n")