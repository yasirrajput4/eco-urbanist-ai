"""
Train Pix2Pix Model on Maps Dataset
Simple, clear training script
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import sys
from pathlib import Path
import tensorflow as tf
import numpy as np
import time
import logging

sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================
# CONFIGURATION
# ============================================================
EPOCHS = 20  # Start with 20, increase to 50-100 for better results
BATCH_SIZE = 1
IMG_WIDTH = 256
IMG_HEIGHT = 256
BUFFER_SIZE = 400

DATASET_PATH = Path("data/training/maps")
CHECKPOINT_DIR = Path("models/checkpoints")
WEIGHTS_DIR = Path("models/trained_weights")

CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# DATA LOADING
# ============================================================

def load(image_file):
    """Load and split image into input and target"""
    image = tf.io.read_file(image_file)
    image = tf.image.decode_jpeg(image)
    
    w = tf.shape(image)[1]
    w = w // 2
    
    input_image = image[:, :w, :]
    real_image = image[:, w:, :]
    
    input_image = tf.cast(input_image, tf.float32)
    real_image = tf.cast(real_image, tf.float32)
    
    return input_image, real_image


def resize(input_image, real_image, height, width):
    input_image = tf.image.resize(input_image, [height, width],
                                   method=tf.image.ResizeMethod.NEAREST_NEIGHBOR)
    real_image = tf.image.resize(real_image, [height, width],
                                  method=tf.image.ResizeMethod.NEAREST_NEIGHBOR)
    return input_image, real_image


def random_crop(input_image, real_image):
    stacked_image = tf.stack([input_image, real_image], axis=0)
    cropped_image = tf.image.random_crop(
        stacked_image, size=[2, IMG_HEIGHT, IMG_WIDTH, 3])
    return cropped_image[0], cropped_image[1]


def normalize(input_image, real_image):
    input_image = (input_image / 127.5) - 1
    real_image = (real_image / 127.5) - 1
    return input_image, real_image


@tf.function()
def random_jitter(input_image, real_image):
    input_image, real_image = resize(input_image, real_image, 286, 286)
    input_image, real_image = random_crop(input_image, real_image)
    
    if tf.random.uniform(()) > 0.5:
        input_image = tf.image.flip_left_right(input_image)
        real_image = tf.image.flip_left_right(real_image)
    
    return input_image, real_image


def load_image_train(image_file):
    input_image, real_image = load(image_file)
    input_image, real_image = random_jitter(input_image, real_image)
    input_image, real_image = normalize(input_image, real_image)
    return input_image, real_image


def load_image_test(image_file):
    input_image, real_image = load(image_file)
    input_image, real_image = resize(input_image, real_image, IMG_HEIGHT, IMG_WIDTH)
    input_image, real_image = normalize(input_image, real_image)
    return input_image, real_image


# ============================================================
# LOSS FUNCTIONS
# ============================================================

loss_object = tf.keras.losses.BinaryCrossentropy(from_logits=True)

def discriminator_loss(disc_real_output, disc_generated_output):
    real_loss = loss_object(tf.ones_like(disc_real_output), disc_real_output)
    generated_loss = loss_object(tf.zeros_like(disc_generated_output), disc_generated_output)
    total_disc_loss = real_loss + generated_loss
    return total_disc_loss


def generator_loss(disc_generated_output, gen_output, target):
    gan_loss = loss_object(tf.ones_like(disc_generated_output), disc_generated_output)
    l1_loss = tf.reduce_mean(tf.abs(target - gen_output))
    total_gen_loss = gan_loss + (100 * l1_loss)
    return total_gen_loss, gan_loss, l1_loss


# ============================================================
# TRAINING
# ============================================================

def train():
    print("\n" + "="*60)
    print("🚀 PIX2PIX TRAINING STARTING")
    print("="*60)
    print(f"📁 Dataset: {DATASET_PATH}")
    print(f"🎯 Epochs: {EPOCHS}")
    print(f"📦 Batch size: {BATCH_SIZE}")
    print(f"🖼️  Image size: {IMG_WIDTH}x{IMG_HEIGHT}")
    print("="*60 + "\n")
    
    # Load dataset
    print("📂 Loading dataset...")
    
    train_dir = DATASET_PATH / "train"
    val_dir = DATASET_PATH / "val"
    
    if not train_dir.exists():
        print(f"❌ ERROR: {train_dir} not found!")
        return
    
    train_files = sorted([str(f) for f in train_dir.glob("*.jpg")])
    val_files = sorted([str(f) for f in val_dir.glob("*.jpg")])
    
    print(f"✅ Found {len(train_files)} training images")
    print(f"✅ Found {len(val_files)} validation images")
    
    train_dataset = tf.data.Dataset.from_tensor_slices(train_files)
    train_dataset = train_dataset.map(load_image_train, num_parallel_calls=tf.data.AUTOTUNE)
    train_dataset = train_dataset.shuffle(BUFFER_SIZE)
    train_dataset = train_dataset.batch(BATCH_SIZE)
    
    print("✅ Datasets created!\n")
    
    # Build models
    print("🎨 Building models...")
    
    from app.models.pix2pix import Pix2PixModel
    
    model = Pix2PixModel(img_size=IMG_WIDTH)
    generator = model.generator
    discriminator = model.discriminator
    
    print("✅ Generator ready")
    print("✅ Discriminator ready\n")
    
    # Optimizers
    generator_optimizer = tf.keras.optimizers.Adam(2e-4, beta_1=0.5)
    discriminator_optimizer = tf.keras.optimizers.Adam(2e-4, beta_1=0.5)
    
    # Training step
    @tf.function
    def train_step(input_image, target):
        with tf.GradientTape() as gen_tape, tf.GradientTape() as disc_tape:
            gen_output = generator(input_image, training=True)
            
            disc_real_output = discriminator([input_image, target], training=True)
            disc_generated_output = discriminator([input_image, gen_output], training=True)
            
            gen_total_loss, gen_gan_loss, gen_l1_loss = generator_loss(
                disc_generated_output, gen_output, target
            )
            disc_loss = discriminator_loss(disc_real_output, disc_generated_output)
        
        generator_gradients = gen_tape.gradient(gen_total_loss, generator.trainable_variables)
        discriminator_gradients = disc_tape.gradient(disc_loss, discriminator.trainable_variables)
        
        generator_optimizer.apply_gradients(zip(generator_gradients, generator.trainable_variables))
        discriminator_optimizer.apply_gradients(zip(discriminator_gradients, discriminator.trainable_variables))
        
        return gen_total_loss, disc_loss
    
    # Training loop
    print("🏋️ Starting training...\n")
    
    start_time = time.time()
    
    for epoch in range(EPOCHS):
        epoch_start = time.time()
        
        print(f"{'='*60}")
        print(f"📊 Epoch {epoch+1}/{EPOCHS}")
        print(f"{'='*60}")
        
        for step, (input_img, target) in enumerate(train_dataset):
            gen_loss, disc_loss = train_step(input_img, target)
            
            if step % 100 == 0:
                print(f"   Step {step:4d} | G_loss: {gen_loss:.4f} | D_loss: {disc_loss:.4f}")
        
        epoch_time = time.time() - epoch_start
        print(f"✅ Epoch {epoch+1} done in {epoch_time:.1f}s")
        
        # Save checkpoint every 5 epochs
        if (epoch + 1) % 5 == 0:
            checkpoint_path = CHECKPOINT_DIR / f"generator_epoch_{epoch+1}.h5"
            generator.save_weights(str(checkpoint_path))
            print(f"💾 Checkpoint saved: {checkpoint_path}")
        
        print()
    
    # Save final model
    final_path = WEIGHTS_DIR / "generator_final.h5"
    generator.save_weights(str(final_path))
    
    total_time = time.time() - start_time
    
    print("\n" + "="*60)
    print("🎉 TRAINING COMPLETE!")
    print("="*60)
    print(f"⏱️  Total time: {total_time/60:.1f} minutes")
    print(f"💾 Model saved: {final_path}")
    print("="*60)
    print("\n✅ Restart your backend to use the trained model!\n")


if __name__ == "__main__":
    train()