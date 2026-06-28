"""
Visualize DeepGlobe dataset samples
"""
import cv2
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt

print("\n" + "="*60)
print("🖼️  VISUALIZING DEEPGLOBE DATASET")
print("="*60)

# Paths
TRAIN_DIR = Path("data/deepglobe/train")

# Get first 3 image pairs
sat_images = sorted(list(TRAIN_DIR.glob("*_sat.jpg")))[:3]

print(f"\n📊 Found {len(list(TRAIN_DIR.glob('*_sat.jpg')))} satellite images")
print(f"📊 Found {len(list(TRAIN_DIR.glob('*_mask.png')))} mask images")

print("\n🎨 Visualizing first 3 samples...\n")

for sat_path in sat_images:
    # Get corresponding mask
    mask_path = sat_path.parent / sat_path.name.replace("_sat.jpg", "_mask.png")
    
    if not mask_path.exists():
        print(f"⚠️  Mask not found for {sat_path.name}")
        continue
    
    # Load images
    sat_img = cv2.imread(str(sat_path))
    mask_img = cv2.imread(str(mask_path))
    
    # Convert BGR to RGB for display
    sat_rgb = cv2.cvtColor(sat_img, cv2.COLOR_BGR2RGB)
    mask_rgb = cv2.cvtColor(mask_img, cv2.COLOR_BGR2RGB)
    
    # Get image info
    h, w = sat_img.shape[:2]
    
    # Calculate land cover percentages
    total_pixels = h * w
    
    # Forest (green in mask)
    forest_mask = (mask_img[:,:,1] == 255) & (mask_img[:,:,0] == 0) & (mask_img[:,:,2] == 0)
    forest_pct = (np.sum(forest_mask) / total_pixels) * 100
    
    # Urban (cyan in mask)
    urban_mask = (mask_img[:,:,0] == 255) & (mask_img[:,:,1] == 255) & (mask_img[:,:,2] == 0)
    urban_pct = (np.sum(urban_mask) / total_pixels) * 100
    
    print(f"📸 {sat_path.name}")
    print(f"   Size: {w}x{h}")
    print(f"   🌳 Forest: {forest_pct:.1f}%")
    print(f"   🏙️  Urban: {urban_pct:.1f}%")
    print()

print("="*60)
print("✅ Dataset looks good!")
print("="*60)
print("\n💡 Next step: Prepare data for training")
print("="*60 + "\n")