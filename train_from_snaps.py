

from autoencoder_one_conv import make_coders
from gpu import reset_gpu
from loading_images import load_tiles_from_snaps
from settings import Settings
from training import train


def run_training_from_snaps(args: Settings):
    # https://discuss.tensorflow.org/t/recommended-way-to-save-load-data-to-from-disk-to-tf-data-dataset/13983

    reset_gpu()

    coders = make_coders(args.latent_dim)

    tiles = load_tiles_from_snaps(args.snaps)

    train(args, tiles, coders)

