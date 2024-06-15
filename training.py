
import numpy as np

from autoencoder_one_conv import make_coders
from gpu import reset_gpu
from loading import load_tiles_from_snaps
from settings import Settings


def run_training(args: Settings):
    # https://discuss.tensorflow.org/t/recommended-way-to-save-load-data-to-from-disk-to-tf-data-dataset/13983

    reset_gpu()

    coders = make_coders(args.latent_dim)

    tiles = load_tiles_from_snaps(args.snaps)

    np.random.shuffle(tiles)

    split_at = None if args.train_val_spit_at is None else int(args.train_val_spit_at * len(tiles))
    train_tiles = tiles if split_at is None else tiles[:split_at]
    val_tiles = tiles if split_at is None else tiles[split_at:]

    print(f"batch size: {args.batch}")
    print(f"epochs: {args.epochs}")
    print(f"train/val split at {args.train_val_spit_at}")
    print(f"train length: {len(train_tiles)}, test length: {len(val_tiles)}")


    coders.autoencoder.fit(
        train_tiles,
        train_tiles,
        epochs=args.epochs,
        batch_size=args.batch,
        shuffle=True,
        validation_data=(val_tiles, val_tiles),
    )

    coders.autoencoder.save_weights(args.weights_path, overwrite=True)

