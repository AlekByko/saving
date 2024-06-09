import tensorflow as tf



def make_coders():

    latent_dim = 32 # used to be 64 with 3 covn layers, now just 2

    # Define the encoder
    encoder_input = tf.keras.layers.Input(shape=(180, 320, 3), name='encoder_input')
    x = tf.keras.layers.Conv2D(32, 3, activation='relu', padding='same')(encoder_input)
    x = tf.keras.layers.MaxPooling2D((2, 2), padding='same')(x)
    x = tf.keras.layers.Conv2D(64, 3, activation='relu', padding='same')(x)
    x = tf.keras.layers.MaxPooling2D((2, 2), padding='same')(x)
    x = tf.keras.layers.Flatten()(x)
    encoder_output = tf.keras.layers.Dense(latent_dim, name='encoder_output')(x)

    encoder = tf.keras.models.Model(encoder_input, encoder_output, name='encoder')
    encoder.summary()

    # Define the decoder
    decoder_input = tf.keras.layers.Input(shape=(latent_dim,), name='decoder_input')
    x = tf.keras.layers.Dense(45 * 80 * 64, activation='relu')(decoder_input)
    x = tf.keras.layers.Reshape((45, 80, 64))(x)
    x = tf.keras.layers.Conv2DTranspose(64, 3, activation='relu', padding='same')(x)
    x = tf.keras.layers.UpSampling2D((2, 2))(x)
    x = tf.keras.layers.Conv2DTranspose(32, 3, activation='relu', padding='same')(x)
    x = tf.keras.layers.UpSampling2D((2, 2))(x)
    decoder_output = tf.keras.layers.Conv2DTranspose(3, 3, activation='sigmoid', padding='same')(x)

    # Define the autoencoder model
    decoder = tf.keras.models.Model(decoder_input, decoder_output, name='decoder')
    decoder.summary()

    autoencoder = tf.keras.models.Model(encoder_input, decoder(encoder_output), name='autoencoder')

    autoencoder.compile(optimizer='adam', loss='mse')

    return autoencoder, encoder, decoder
