
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf



def show(
    encoder: tf.keras.models.Model, decoder: tf.keras.models.Model, tiles: np.ndarray
):
    encoded_imgs = encoder.predict(tiles)
    decoded_imgs = decoder.predict(encoded_imgs)

    n = 6  # len(test_tiles)
    plt.figure(figsize=(40, 4))
    for i in range(n):
        ax = plt.subplot(2, n, i + 1)
        plt.imshow(tiles[i], aspect="auto")
        plt.title("Original")
        ax.get_xaxis().set_visible(False)
        ax.get_yaxis().set_visible(False)

        ax = plt.subplot(2, n, i + 1 + n)
        plt.imshow(decoded_imgs[i], aspect="auto")
        plt.title("Reconstructed")
        ax.get_xaxis().set_visible(False)
        ax.get_yaxis().set_visible(False)

    plt.show()
