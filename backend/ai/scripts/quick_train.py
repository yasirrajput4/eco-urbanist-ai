"""
QUICK Training - Optimized for Speed
Uses fewer images for faster demonstration training
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import sys
from pathlib import Path
import tensorflow as tf
import time

sys.path.insert(0, str(Path(__file__).parent.parent))

# ============================================================
# QUICK CONFIGURATION - OPTIMIZED FOR SPEED
# ============================================================
EPOCHS = 5  # Fewer epochs
BATCH_SIZE = 4  # Larger batches = faster
IMG_WIDTH = 256  # Correct size for architecture
IMG_HEIGHT = 256
BUFFER_SIZE = 100
MAX_TRAIN_IMAGES = 100  # Only 100 images for quick training

DATASET_PATH = Path("data/training/maps")
WEIGHTS_DIR = Path("models/trained_weights")
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# DATA LOADING
# ============================================================

def load(image_file):
    """Load and split image"""
    image = tf.io.read_file(image_file)
    image = tf.image.decode_jpeg(image)
    
    w = tf.shape(image)[1]
    w = w // 2
    
    input_image = image[:, :w, :]
    real_image = image[:, w:, :]
    
    input_image = tf.cast(input_image, tf.float32)
    real_image = tf.cast(real_image, tf.float32)
    
    return input_image, real_image


def resize(input_image, real_image):
    """Resize to target size"""
    input_image = tf.image.resize(input_image, [IMG_HEIGHT, IMG_WIDTH])
    real_image = tf.image.resize(real_image, [IMG_HEIGHT, IMG_WIDTH])
    return input_image, real_image


def normalize(input_image, real_image):
    """Normalize to [-1, 1]"""
    input_image = (input_image / 127.5) - 1
    real_image = (real_image / 127.5) - 1
    return input_image, real_image


def load_image_train(image_file):
    """Load and preprocess training image"""
    input_image, real_image = load(image_file)
    input_image, real_image = resize(input_image, real_image)
    input_image, real_image = normalize(input_image, real_image)
    return input_image, real_image


# ============================================================
# LOSS FUNCTIONS
# ============================================================

loss_object = tf.keras.losses.BinaryCrossentropy(from_logits=True)


def discriminator_loss(disc_real_output, disc_generated_output):
    """Calculate discriminator loss"""
    real_loss = loss_object(tf.ones_like(disc_real_output), disc_real_output)
    generated_loss = loss_object(tf.zeros_like(disc_generated_output), disc_generated_output)
    total_disc_loss = real_loss + generated_loss
    return total_disc_loss


def generator_loss(disc_generated_output, gen_output, target):
    """Calculate generator loss"""
    gan_loss = loss_object(tf.ones_like(disc_generated_output), disc_generated_output)
    l1_loss = tf.reduce_mean(tf.abs(target - gen_output))
    total_gen_loss = gan_loss + (100 * l1_loss)
    return total_gen_loss, gan_loss, l1_loss


# ============================================================
# QUICK TRAINING FUNCTION
# ============================================================

def quick_train():
    """Main quick training function"""
    
    print("\n" + "="*60)
    print("⚡ QUICK TRAINING MODE - OPTIMIZED FOR SPEED")
    print("="*60)
    print(f"🎯 Epochs: {EPOCHS} (reduced)")
    print(f"📦 Batch size: {BATCH_SIZE} (increased)")
    print(f"🖼️  Image size: {IMG_WIDTH}x{IMG_HEIGHT}")
    print(f"📊 Training images: {MAX_TRAIN_IMAGES} (subset)")
    print(f"⏱️  Estimated time: 45-90 minutes")
    print("="*60 + "\n")
    
    # ========================================
    # LOAD LIMITED DATASET
    # ========================================
    
    print("📂 Loading dataset (limited subset for speed)...")
    
    train_dir = DATASET_PATH / "train"
    
    if not train_dir.exists():
        print(f"❌ ERROR: {train_dir} not found!")
        return
    
    # Use only first N images
    train_files = sorted([str(f) for f in train_dir.glob("*.jpg")])[:MAX_TRAIN_IMAGES]
    
    if len(train_files) == 0:
        print(f"❌ ERROR: No images found in {train_dir}")
        return
    
    print(f"✅ Using {len(train_files)} images (faster training)")
    
    # Create optimized dataset
    train_dataset = tf.data.Dataset.from_tensor_slices(train_files)
    train_dataset = train_dataset.map(load_image_train, num_parallel_calls=tf.data.AUTOTUNE)
    train_dataset = train_dataset.cache()  # Cache in memory for speed
    train_dataset = train_dataset.shuffle(BUFFER_SIZE)
    train_dataset = train_dataset.batch(BATCH_SIZE)
    train_dataset = train_dataset.prefetch(tf.data.AUTOTUNE)  # Prefetch for speed
    
    print("✅ Dataset created and optimized!\n")
    
    # ========================================
    # BUILD MODELS
    # ========================================
    
    print("🎨 Building Pix2Pix models...")
    
    from app.models.pix2pix import Pix2PixModel
    
    model = Pix2PixModel(img_size=IMG_WIDTH)
    generator = model.generator
    discriminator = model.discriminator
    
    print("✅ Generator built")
    print("✅ Discriminator built\n")
    
    # ========================================
    # OPTIMIZERS
    # ========================================
    
    generator_optimizer = tf.keras.optimizers.Adam(2e-4, beta_1=0.5)
    discriminator_optimizer = tf.keras.optimizers.Adam(2e-4, beta_1=0.5)
    
    # ========================================
    # TRAINING STEP
    # ========================================
    
    @tf.function
    def train_step(input_image, target):
        """Single training step"""
        with tf.GradientTape() as gen_tape, tf.GradientTape() as disc_tape:
            # Generate output
            gen_output = generator(input_image, training=True)
            
            # Discriminator outputs
            disc_real_output = discriminator([input_image, target], training=True)
            disc_generated_output = discriminator([input_image, gen_output], training=True)
            
            # Calculate losses
            gen_total_loss, gen_gan_loss, gen_l1_loss = generator_loss(
                disc_generated_output, gen_output, target
            )
            disc_loss = discriminator_loss(disc_real_output, disc_generated_output)
        
        # Calculate gradients
        generator_gradients = gen_tape.gradient(
            gen_total_loss, generator.trainable_variables
        )
        discriminator_gradients = disc_tape.gradient(
            disc_loss, discriminator.trainable_variables
        )
        
        # Apply gradients
        generator_optimizer.apply_gradients(
            zip(generator_gradients, generator.trainable_variables)
        )
        discriminator_optimizer.apply_gradients(
            zip(discriminator_gradients, discriminator.trainable_variables)
        )
        
        return gen_total_loss, disc_loss
    
    # ========================================
    # TRAINING LOOP
    # ========================================
    
    print("⚡ QUICK TRAINING STARTING...\n")
    
    start_time = time.time()
    
    for epoch in range(EPOCHS):
        epoch_start = time.time()
        
        print(f"{'='*60}")
        print(f"📊 Epoch {epoch+1}/{EPOCHS}")
        print(f"{'='*60}")
        
        # Train on batches
        for step, (input_img, target) in enumerate(train_dataset):
            gen_loss, disc_loss = train_step(input_img, target)
            
            # Show progress every 5 steps
            if step % 5 == 0:
                print(f"   Step {step:3d} | G_loss: {gen_loss:.4f} | D_loss: {disc_loss:.4f}")
        
        epoch_time = time.time() - epoch_start
        print(f"✅ Epoch {epoch+1} completed in {epoch_time:.1f}s")
        print()
    
    # ========================================
    # SAVE FINAL MODEL
    # ========================================
    
    final_path = WEIGHTS_DIR / "generator_final.h5"
    generator.save_weights(str(final_path))
    
    total_time = time.time() - start_time
    
    print("\n" + "="*60)
    print("🎉 QUICK TRAINING COMPLETE!")
    print("="*60)
    print(f"⏱️  Total time: {total_time/60:.1f} minutes")
    print(f"💾 Model saved: {final_path}")
    print("="*60)
    print("\n✅ Model ready! Restart backend to use trained weights.\n")


if __name__ == "__main__":
    quick_train()