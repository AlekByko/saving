import glob
import os

from PIL import Image, UnidentifiedImageError

from handling_files import maybe_move_file
from settings import Settings


def run_image_sorter(args: Settings):
    pathes = glob.glob(args.samples_dir + "*")
    for path in pathes:
        if os.path.isdir(path):
            continue

        try:
            image = Image.open(path)
            x, y = image.size
            dir_name = f"{x}x{y}"
            image.close()
            maybe_move_file(args.samples_dir, dir_name, path)
            print(f"Moved: {dir_name}: {path}")

        except UnidentifiedImageError:
            dir_name = "bad"
            maybe_move_file(args.samples_dir, dir_name, path)
            print(f"Moved {dir_name}: {path}")
            pass


