import numpy as np
from PIL import Image

from autoencoder import Coders, dump_coder_summaries, make_coders
from config import load_config, save_config
from gpu import reset_gpu
from loading_images import load_tiles_from_image_ext
from settings import Settings


def run_snapping_for_one(args: Settings):
    reset_gpu()
    coders = make_coders(args.latent_dim)
    dump_coder_summaries(coders)
    coders.autoencoder.load_weights(args.weights_path)

    return run_single_snapping(args.image_path, args.config_path, coders, args.snap_path)

def run_snapping_for_all(args: Settings):
    reset_gpu()
    coders = make_coders(args.latent_dim)
    dump_coder_summaries(coders)
    coders.autoencoder.load_weights(args.weights_path)

    for snap in args.snaps:
        run_single_snapping(snap.image_path, snap.config_path, coders, snap.snap_path)

def run_single_snapping(image_path: str, config_path: str, coders: Coders, snap_path: str):

    img = Image.open(image_path)
    config = load_config(config_path)
    tiles = load_tiles_from_image_ext(img, config)

    white = (255, 255, 255)
    snap = Image.new('RGB', img.size, white)

    latents = coders.encoder.predict(tiles)
    caps = coders.decoder.predict(latents)

    for i in range(len(config.tiles)):
        tile_config = config.tiles[i]
        latent = latents[i]
        tile_config.data['latent'] = latent.tolist()
        cap_data = caps[i]
        cap_data = (cap_data * 255).astype(np.uint8)
        cap_image = Image.fromarray(cap_data, 'RGB')
        pos = (tile_config.x, tile_config.y)
        snap.paste(cap_image, pos)

    snap.save(snap_path)
    save_config(config_path, config)
    print(snap_path)


