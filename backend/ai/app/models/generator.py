"""
Generator model for Pix2Pix
U-Net architecture with skip connections
"""
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


def downsample(filters, size, apply_batchnorm=True):
    """Downsampling block"""
    initializer = tf.random_normal_initializer(0., 0.02)

    result = keras.Sequential()
    result.add(layers.Conv2D(filters, size, strides=2, padding='same',
                            kernel_initializer=initializer, use_bias=False))

    if apply_batchnorm:
        result.add(layers.BatchNormalization())

    result.add(layers.LeakyReLU())

    return result


def upsample(filters, size, apply_dropout=False):
    """Upsampling block"""
    initializer = tf.random_normal_initializer(0., 0.02)

    result = keras.Sequential()
    result.add(layers.Conv2DTranspose(filters, size, strides=2,
                                     padding='same',
                                     kernel_initializer=initializer,
                                     use_bias=False))

    result.add(layers.BatchNormalization())

    if apply_dropout:
        result.add(layers.Dropout(0.5))

    result.add(layers.ReLU())

    return result


def build_generator(input_shape=(256, 256, 3)):
    """
    Build U-Net generator

    Args:
        input_shape: Input image shape (height, width, channels)

    Returns:
        Generator model
    """
    inputs = layers.Input(shape=input_shape)

    # Downsampling stack
    down_stack = [
        downsample(64, 4, apply_batchnorm=False),  # (batch, 128, 128, 64)
        downsample(128, 4),  # (batch, 64, 64, 128)
        downsample(256, 4),  # (batch, 32, 32, 256)
        downsample(512, 4),  # (batch, 16, 16, 512)
        downsample(512, 4),  # (batch, 8, 8, 512)
        downsample(512, 4),  # (batch, 4, 4, 512)
        downsample(512, 4),  # (batch, 2, 2, 512)
        downsample(512, 4),  # (batch, 1, 1, 512)
    ]

    # Upsampling stack
    up_stack = [
        upsample(512, 4, apply_dropout=True),  # (batch, 2, 2, 1024)
        upsample(512, 4, apply_dropout=True),  # (batch, 4, 4, 1024)
        upsample(512, 4, apply_dropout=True),  # (batch, 8, 8, 1024)
        upsample(512, 4),  # (batch, 16, 16, 1024)
        upsample(256, 4),  # (batch, 32, 32, 512)
        upsample(128, 4),  # (batch, 64, 64, 256)
        upsample(64, 4),   # (batch, 128, 128, 128)
    ]

    initializer = tf.random_normal_initializer(0., 0.02)
    last = layers.Conv2DTranspose(3, 4,
                                 strides=2,
                                 padding='same',
                                 kernel_initializer=initializer,
                                 activation='tanh')  # (batch, 256, 256, 3)

    x = inputs

    # Downsampling through the model
    skips = []
    for down in down_stack:
        x = down(x)
        skips.append(x)

    skips = reversed(skips[:-1])

    # Upsampling and establishing skip connections
    for up, skip in zip(up_stack, skips):
        x = up(x)
        x = layers.Concatenate()([x, skip])

    x = last(x)

    return keras.Model(inputs=inputs, outputs=x, name='Generator')