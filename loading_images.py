import glob
import random
from typing import Any, Iterable, List

import numpy as np
from PIL import Image

from config import Config, load_config
from settings import Settings, Snap


def load_tiles_from_snaps(snaps: Iterable[Snap]):
    all_tiles = None
    for snap in snaps:
        print(f"loading from {snap.image_path}")
        snap_tiles = load_tiles_from_image(snap.config_path, snap.image_path)
        if all_tiles is None:
            all_tiles = snap_tiles
        else:
            all_tiles = np.concatenate((all_tiles, snap_tiles))

    return all_tiles


def load_tiles_from_image(config_path: str, image_path: str):
    img = Image.open(image_path)
    config = load_config(config_path)
    return load_tiles_from_image_ext(img, config)


def load_tiles_from_image_ext(img: Image.Image, config: Config):
    tiles = []
    for cfg in config.tiles:
        if cfg.width != 320:
            raise Exception(f"Bad tile width {cfg.width}.")
        if cfg.height != 180:
            raise Exception(f"Bad tile height {cfg.height}.")

        tile_image = img.crop((cfg.x, cfg.y, cfg.x + cfg.width, cfg.y + cfg.height))
        bytes = np.array(tile_image)

        floats = bytes / 255.0
        floats = floats.astype(np.float32)
        tiles.append(floats)

    return np.array(tiles)


def load_samples_as_list(args: Settings) -> List[Any]:
    pattern = args.samples_dir + "*"
    paths = glob.glob(pattern)
    if len(paths) < 1:
        print(f"No samples at {args.samples_dir}.")
        return
    random.shuffle(paths)
    length = min(len(paths), args.max_samples)
    samples = []
    for i in range(length):
        path = paths[i]
        if i % 100 == 0:
            print(f"Loading images: {i} {int(100*i/length)}% ")
        image = Image.open(path)

        bytes = np.array(image)
        if len(bytes.shape) != 3 or bytes.shape[2] != 1:
            print(f"Bad shape: {bytes.shape}, skipping...")
            continue
        bytes = np.expand_dims(bytes, axis=-1)


        floats = bytes / 255.0
        floats = floats.astype(np.float32)
        samples.append(floats)
    print(f"Loading images: {length} 100% ")
    return samples
