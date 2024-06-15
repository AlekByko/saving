import tensorflow as tf
from keras import layers


def make_coders():

    by2x2 = (2, 2)
    by3x2 = (3, 2)
    by3x3 = (3, 3)
    latent_dim = 64 #  loss: 0.0025
    # latent_dim = 128 #  loss: 0.0023
    # latent_dim = 256 #  loss: 0.0023
    # going 128, 64, 32 (instead of 32, 64, 128), at latent_dim 64 requires more time with loss: 0.0032

    # Define the encoder
    encoder_input = layers.Input(shape=(180, 320, 3), name='encoder_input')

    x = layers.Conv2D(32, by3x3, activation='relu', padding='same')(encoder_input)
    x = layers.MaxPooling2D(by2x2, padding='same')(x)

    x = layers.Conv2D(64, by3x3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D(by3x2, padding='same')(x) # <---- 3x2

    # CNN 128 should stay:
    x = layers.Conv2D(128, by3x3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D(by2x2, padding='same')(x)


    x = layers.Flatten()(x)

    # x = layers.Dropout(rate=0.3)(x) # <--- doesn't help
    encoder_output = layers.Dense(latent_dim, name='encoder_output')(x)

    encoder = tf.keras.models.Model(encoder_input, encoder_output, name='encoder')
    encoder.summary()

    # Define the decoder
    decoder_input = layers.Input(shape=(latent_dim,), name='decoder_input')
    x = layers.Dense(15 * 40 * 32, activation='relu')(decoder_input)
    x = layers.Reshape((15, 40, 32))(x)

    # CNN 128 should stay:
    x = layers.Conv2DTranspose(32, by3x3, activation='relu', padding='same')(x)
    x = layers.UpSampling2D(by2x2)(x)

    x = layers.Conv2DTranspose(64, by3x3, activation='relu', padding='same')(x)
    x = layers.UpSampling2D(by3x2)(x) # <---- 3x2

    x = layers.Conv2DTranspose(128, by3x3, activation='relu', padding='same')(x)
    x = layers.UpSampling2D(by2x2)(x)

    decoder_output = layers.Conv2DTranspose(3, by3x3, activation='sigmoid', padding='same')(x)
    decoder = tf.keras.models.Model(decoder_input, decoder_output, name='decoder')

    autoencoder = tf.keras.models.Model(encoder_input, decoder(encoder_output), name='autoencoder')

    autoencoder.compile(optimizer='adam', loss='mse')

    return Coders(autoencoder, encoder, decoder)

class Coders:
    def __init__(self,
                 autoencoder: tf.keras.models.Model,
                 encoder:  tf.keras.models.Model,
                 decoder:  tf.keras.models.Model
                 ):
        self.autoencoder = autoencoder
        self.encoder = encoder
        self.decoder = decoder

def dump_coder_summaries(coders: Coders):
    coders.encoder.summary()
    coders.decoder.summary()
