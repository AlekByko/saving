
import numpy as np 
from keras.callbacks import ModelCheckpoint

from autoencoder_one_conv import Coders
from settings import Settings



def train(args: Settings, samples, coders: Coders):

    np.random.shuffle(samples)

    split_at = None if args.train_val_spit_at is None else int(args.train_val_spit_at * len(samples))
    train_tiles = samples if split_at is None else samples[:split_at]
    val_tiles = samples if split_at is None else samples[split_at:]

    print(f"batch size: {args.batch}")
    print(f"epochs: {args.epochs}")
    print(f"train/val split at {args.train_val_spit_at}")
    print(f"train length: {len(train_tiles)}, test length: {len(val_tiles)}")

    checkpoint_callback = ModelCheckpoint(
        filepath=args.weights_path,
        save_weights_only=True,
        save_freq='epoch',
        period=5,
    )

    coders.autoencoder.fit(
        train_tiles,
        train_tiles,
        epochs=args.epochs,
        batch_size=args.batch,
        shuffle=True,
        validation_data=(val_tiles, val_tiles),
        callbacks=[checkpoint_callback],
    )

    coders.autoencoder.save_weights(args.weights_path, overwrite=True)

