"""
Create realistic, VISIBLE tree and bush icons for overlay
"""
import cv2
import numpy as np
from pathlib import Path

ICONS_DIR = Path("assets/icons")
ICONS_DIR.mkdir(parents=True, exist_ok=True)

def create_tree_icon(size=40):
    """Create a realistic, VISIBLE top-view tree icon"""
    img = np.zeros((size, size, 4), dtype=np.uint8)  # BGRA with alpha
    center = size // 2
    
    # Outer canopy (darker green) - MUCH MORE VISIBLE
    cv2.circle(img, (center, center), size//2 - 2, (20, 100, 30, 255), -1)
    
    # Middle ring (bright green)
    cv2.circle(img, (center, center), size//3 + 2, (30, 180, 40, 255), -1)
    
    # Inner highlight (very bright green)
    cv2.circle(img, (center - 3, center - 3), size//5, (60, 220, 80, 255), -1)
    
    # Add texture spots (darker patches)
    for _ in range(12):
        angle = np.random.uniform(0, 2 * np.pi)
        distance = np.random.uniform(size//6, size//3)
        x = int(center + distance * np.cos(angle))
        y = int(center + distance * np.sin(angle))
        r = np.random.randint(2, 5)
        cv2.circle(img, (x, y), r, (15, 80, 20, 255), -1)
    
    return img

def create_bush_icon(size=25):
    """Create a VISIBLE bush icon"""
    img = np.zeros((size, size, 4), dtype=np.uint8)
    center = size // 2
    
    # Bush base (bright green)
    cv2.circle(img, (center, center), size//2 - 1, (35, 160, 45, 255), -1)
    
    # Highlight
    cv2.circle(img, (center - 2, center - 2), size//4, (50, 200, 70, 255), -1)
    
    # Texture
    for _ in range(6):
        angle = np.random.uniform(0, 2 * np.pi)
        distance = np.random.uniform(size//8, size//4)
        x = int(center + distance * np.cos(angle))
        y = int(center + distance * np.sin(angle))
        r = np.random.randint(1, 3)
        cv2.circle(img, (x, y), r, (25, 130, 35, 255), -1)
    
    return img

def create_grass_patch(size=15):
    """Create VISIBLE grass patch"""
    img = np.zeros((size, size, 4), dtype=np.uint8)
    center = size // 2
    
    # Grass (bright green)
    cv2.circle(img, (center, center), size//2 - 1, (40, 190, 60, 220), -1)
    
    # Highlight
    cv2.circle(img, (center - 1, center - 1), size//4, (60, 220, 80, 200), -1)
    
    return img

# Create different sizes - MUCH LARGER AND MORE VISIBLE!
print("🌳 Creating VISIBLE tree icons...")

# Large trees (30-45px)
for i in range(3):
    size = np.random.randint(35, 46)
    icon = create_tree_icon(size)
    cv2.imwrite(str(ICONS_DIR / f"tree_large_{i}.png"), icon)
    print(f"   ✅ Large tree {i}: {size}px")

# Medium trees (22-35px)
for i in range(3):
    size = np.random.randint(25, 36)
    icon = create_tree_icon(size)
    cv2.imwrite(str(ICONS_DIR / f"tree_medium_{i}.png"), icon)
    print(f"   ✅ Medium tree {i}: {size}px")

# Small trees (15-22px)
for i in range(3):
    size = np.random.randint(18, 26)
    icon = create_tree_icon(size)
    cv2.imwrite(str(ICONS_DIR / f"tree_small_{i}.png"), icon)
    print(f"   ✅ Small tree {i}: {size}px")

# Bushes (18-28px)
for i in range(3):
    size = np.random.randint(20, 29)
    icon = create_bush_icon(size)
    cv2.imwrite(str(ICONS_DIR / f"bush_{i}.png"), icon)
    print(f"   ✅ Bush {i}: {size}px")

# Grass (12-18px)
for i in range(3):
    size = np.random.randint(12, 19)
    icon = create_grass_patch(size)
    cv2.imwrite(str(ICONS_DIR / f"grass_{i}.png"), icon)
    print(f"   ✅ Grass {i}: {size}px")

print("\n✅ Created 15 LARGE, VISIBLE vegetation icons!")
print(f"📁 Saved to: {ICONS_DIR}")
print("\n💡 Icons are now 3-5x larger and much more visible!")