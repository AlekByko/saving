import glob
import os

from PIL import Image

from settings import Settings


def run_scaling_images(args: Settings):
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

    for path in pathes:
        if os.path.isdir(path):
            continue

        file_name = os.path.splitext(os.path.basename(path))[0] + ".png"
        image = Image.open(path)
        width, height = image.size
        if expected_width != width or expected_height != height:
            print(f"Bad width {width}x{height} of {file_name}, should be {expected_width}x{expected_height}.")
            continue

        resized = image.resize((target_width, target_height), resample=Image.LANCZOS)

        dir_path = os.path.join(args.samples_dir, dir_name)
        if not is_dir_checked:
            is_dir_checked = True
            if not os.path.exists(dir_path):
                os.makedirs(dir_path)

        target_path = os.path.join(dir_path, file_name)
        resized.save(target_path)

        resized.close()
        image.close()

        print(f"Resized: {dir_name}: {file_name}")

