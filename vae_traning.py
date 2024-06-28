
import numpy as np

from gpu import reset_gpu
from loading_images import load_tiles_from_snaps
from settings import Settings
from vae import make_vae


def run_vae_training(args: Settings):
    reset_gpu()

    tiles = load_tiles_from_snaps(args.snaps)

    np.random.shuffle(tiles)

    #split_at = int(0.8 * len(tiles))
    train_tiles = tiles#[:split_at]
    test_tiles = tiles#[split_at:]

    print(f"train length: {len(train_tiles)}, test length: {len(test_tiles)}")

    vae, encoder, decoder = make_vae()

    vae.fit(
        train_tiles,
        train_tiles,
        epochs=args.epochs,
        batch_size=args.batch,
        shuffle=True,
        # validation_data=(test_tiles, test_tiles), # <-- only for keeping the eye on how well model converges
    )

    vae.save_weights(args.weights_path, overwrite=True)


