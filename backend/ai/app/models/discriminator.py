"""
Discriminator Model (PatchGAN)
Classifies whether image patches are real or fake
"""
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# CORRECTED IMPORT
from app.models.layers import downsample


def build_discriminator(input_shape=(256, 256, 3)):
    """
    Build PatchGAN Discriminator

    Args:
        input_shape: Shape of input image (H, W, C)

    Returns:
        Keras Model: Discriminator model
    """
    initializer = tf.random_normal_initializer(0., 0.02)

    # Input image
    inp = keras.Input(shape=input_shape, name='input_image')

    # Target/Generated image
    tar = keras.Input(shape=input_shape, name='target_image')

    # Concatenate input and target
    x = layers.concatenate([inp, tar])  # (256, 256, 6)

    # Downsampling layers
    down1 = downsample(64, 4, apply_batchnorm=False)(x)   # (128, 128, 64)
    down2 = downsample(128, 4)(down1)                      # (64, 64, 128)
    down3 = downsample(256, 4)(down2)                      # (32, 32, 256)

    # Zero padding
    zero_pad1 = layers.ZeroPadding2D()(down3)              # (34, 34, 256)

    # Conv layer
    conv = layers.Conv2D(
        512,
        4,
        strides=1,
        kernel_initializer=initializer,
        use_bias=False
    )(zero_pad1)  # (31, 31, 512)

    # Batch normalization
    batchnorm1 = layers.BatchNormalization()(conv)

    # Leaky ReLU
    leaky_relu = layers.LeakyReLU()(batchnorm1)

    # Zero padding
    zero_pad2 = layers.ZeroPadding2D()(leaky_relu)         # (33, 33, 512)

    # Final layer - outputs patch predictions
    last = layers.Conv2D(
        1,
        4,
        strides=1,
        kernel_initializer=initializer
    )(zero_pad2)  # (30, 30, 1)

    return keras.Model(inputs=[inp, tar], outputs=last, name='Discriminator')