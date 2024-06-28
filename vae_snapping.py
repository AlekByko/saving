import numpy as np
from PIL import Image

from config import load_config, save_config
from gpu import reset_gpu
from loading_images import load_tiles_from_image_ext
from settings import Settings
from vae import make_vae


def run_vae_snapping_for_one(args: Settings):
    reset_gpu()

    vae, encoder, decoder = make_vae()

    #vae.summary()

    vae.load_weights(args.weights_path)

    return run_vae_single_snapping(args.image_path, args.config_path, encoder, decoder, args.snap_path)

def run_vae_snapping_for_all(args: Settings):
    reset_gpu()

    vae, encoder, decoder = make_vae()
    #vae.summary()

    vae.load_weights(args.weights_path)

    for snap in args.snaps:
        run_vae_single_snapping(snap.image_path, snap.config_path, encoder, decoder, snap.snap_path)

def run_vae_single_snapping(image_path: str, config_path: str, encoder, decoder, snap_path: str):

    img = Image.open(image_path)
    config = load_config(config_path)
    tiles = load_tiles_from_image_ext(img, config)

    white = (255, 255, 255)
    snap = Image.new('RGB', img.size, white)

    # z_mean, z_log_var, latents = encoder.predict(tiles)
    latents = encoder.predict(tiles)

    caps = decoder.predict(latents)

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


