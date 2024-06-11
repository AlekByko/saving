import numpy as np
from PIL import Image

from autoencoder import dump_coder_summaries, make_coders
from config import load_config, save_config
from gpu import reset_gpu
from loading import load_tiles_from_image_ext
from settings import Settings


def run_snapping(args: Settings):

    reset_gpu()
    img = Image.open(args.image_path)
    config = load_config(args.config_path)
    tiles = load_tiles_from_image_ext(img, config)

    white = (255, 255, 255)
    snap = Image.new('RGB', img.size, white)

    coders = make_coders()
    dump_coder_summaries(coders)
    coders.autoencoder.load_weights(args.weights_path)

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

    snap.save(args.snap_path)
    save_config(args.config_path, config)


