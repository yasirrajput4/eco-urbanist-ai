"""
Custom Layers for Pix2Pix
Downsample and Upsample blocks for U-Net architecture
"""
import tensorflow as tf
from tensorflow.keras import layers


def downsample(filters, size, apply_batchnorm=True):
    """
    Downsampling layer (Encoder)

    Args:
        filters: Number of filters
        size: Filter size
        apply_batchnorm: Whether to apply batch normalization

    Returns:
        Sequential model for downsampling
    """
    initializer = tf.random_normal_initializer(0., 0.02)

    result = tf.keras.Sequential()

    result.add(layers.Conv2D(
        filters,
        size,
        strides=2,
        padding='same',
        kernel_initializer=initializer,
        use_bias=False
    ))

    if apply_batchnorm:
        result.add(layers.BatchNormalization())

    result.add(layers.LeakyReLU())

    return result


def upsample(filters, size, apply_dropout=False):
    """
    Upsampling layer (Decoder) with skip connections

    Args:
        filters: Number of filters
        size: Filter size
        apply_dropout: Whether to apply dropout

    Returns:
        Function that applies upsampling with skip connection
    """
    initializer = tf.random_normal_initializer(0., 0.02)

    def apply(x, skip_connection):
        """
        Apply upsampling with skip connection

        Args:
            x: Input tensor
            skip_connection: Skip connection from encoder

        Returns:
            Upsampled tensor concatenated with skip connection
        """
        # Upsample
        x = layers.Conv2DTranspose(
            filters,
            size,
            strides=2,
            padding='same',
            kernel_initializer=initializer,
            use_bias=False
        )(x)

        # Batch normalization
        x = layers.BatchNormalization()(x)

        # Dropout if specified
        if apply_dropout:
            x = layers.Dropout(0.5)(x)

        # ReLU activation
        x = layers.ReLU()(x)

        # Concatenate with skip connection
        x = layers.Concatenate()([x, skip_connection])

        return x

    return apply