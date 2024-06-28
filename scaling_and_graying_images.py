import glob
import os

from PIL import Image, ImageOps, UnidentifiedImageError

from handling_files import maybe_move_file
from settings import Settings


def run_scaling_and_graying_images(args: Settings):

    pathes = glob.glob(args.samples_dir + "*")

    print(f"Wokring on {args.sample_size}")

    expected_width, expected_height = args.input_size
    print(f"Expected size: {expected_width} x {expected_height}")
    print(f"Scale factor: {args.scale_factor}")

    target_width = int(args.scale_factor * expected_width)
    target_height = int(args.scale_factor * expected_height)
    print(f"Target size: {target_width} x {target_height}")

    dir_name = f"{target_width}x{target_height}"

    is_dir_checked = False
    i = 0
    length = len(pathes)
    for path in pathes:
        i += 1
        if os.path.isdir(path):
            continue

        file_name = os.path.splitext(os.path.basename(path))[0] + ".png"
        dir_path = os.path.join(args.samples_dir, dir_name)
        target_path = os.path.join(dir_path, file_name)

        if os.path.exists(target_path):
            print(f"{file_name} exists skipping...")
            continue

        try:
            image = Image.open(path)
            width, height = image.size
            if expected_width != width or expected_height != height:
                print(f"Bad width {width}x{height} of {file_name}, should be {expected_width}x{expected_height}.")
                continue

            resized = image.resize((target_width, target_height), resample=Image.LANCZOS)
            grayed = resized.convert('L')
            leveled = ImageOps.autocontrast(grayed)

            if not is_dir_checked:
                is_dir_checked = True
                if not os.path.exists(dir_path):
                    os.makedirs(dir_path)

            leveled.save(target_path)
            print(f"Resized and grayed: {dir_name}: {file_name}")

            if i % 100 == 0:
                print(f"Processed: {i} {int(100*i/length)}% ")


            image.close()
            resized.close()
            grayed.close()
            leveled.close()

        except (OSError, UnidentifiedImageError):
            dir_name = "bad"
            maybe_move_file(args.samples_dir, dir_name, path)
            print(f"Moved {dir_name}: {path}")
            pass



