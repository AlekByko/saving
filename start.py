import sys

from sampling import run_sampling
from scaling_and_graying_images import run_scaling_and_graying_images
from scaling_images import run_scaling_images
from settings import read_settings
from snapping import run_snapping_for_all
from sort_images import run_image_sorter
from train_from_samples import run_training_from_samples
from train_from_snaps import run_training_from_snaps
from vae_snapping import run_vae_snapping_for_all, run_vae_snapping_for_one
from vae_traning import run_vae_training


def run():
    print(f"Executed from: {sys.executable}")

    args = read_settings()
    match args.mode:
        case "train-from-snaps":
            run_training_from_snaps(args)
        case "train-from-samples":
            run_training_from_samples(args)
        case "sample":
            run_sampling(args)
        case "snap-all":
            run_snapping_for_all(args)
        case "vae-train":
            run_vae_training(args)
        case "vae-snap-one":
            run_vae_snapping_for_one(args)
        case "vae-snap-all":
            run_vae_snapping_for_all(args)
        case "sort-images":
            run_image_sorter(args)
        case "scale-images":
            run_scaling_images(args)
        case "scale-and-gray-images":
            run_scaling_and_graying_images(args)
        case _:
            raise Exception(f"Unexpected mode: {args.mode}")


run()


