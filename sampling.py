
import numpy as np

from autoencoder import dump_coder_summaries, make_coders
from gpu import reset_gpu
from loading_images import load_tiles_from_image
from settings import Settings
from showing import show


def run_sampling(args: Settings):
    reset_gpu()
    tiles = load_tiles_from_image(args.config_path, args.image_path)
    np.random.shuffle(tiles)
    sample_tiles = tiles[:args.sample_size]
    coders = make_coders(args.latent_dim)
    dump_coder_summaries(coders)
    coders.autoencoder.load_weights(args.weights_path)
    show(coders.encoder, coders.decoder, sample_tiles)
