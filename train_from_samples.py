


import tensorflow as tf
from keras.callbacks import ModelCheckpoint

from autoencoder_160x120 import make_autoencoder
from gpu import reset_gpu
from loading_images import load_samples_as_list
from settings import Settings

image_shape = (120, 160, 1)
latent_dim = 256

def run_training_from_samples(args: Settings):

    reset_gpu()
    # https://aws.amazon.com/what-is/overfitting
    # needs at least 50 000 samples better 100 000


    coders = make_autoencoder(image_shape, latent_dim)

    samples = load_samples_as_list(args)


    split_at = None if args.train_val_spit_at is None else int(args.train_val_spit_at * len(samples))
    train_samples = samples if split_at is None else samples[:split_at]
    val_samples = samples if split_at is None else samples[split_at:]

    print(f"batch size: {args.batch}")
    print(f"epochs: {args.epochs}")
    print(f"train/val split at {args.train_val_spit_at}")
    print(f"train length: {len(train_samples)}, test length: {len(val_samples)}")

    checkpoint_callback = ModelCheckpoint(
        filepath=args.weights_path,
        save_weights_only=True,
        save_freq='epoch',
        monitor='val_loss',
        period=5,
    )

    train_dataset = make_dataset(args, train_samples)
    val_dataset = make_dataset(args, val_samples)

    coders.autoencoder.fit(
        train_dataset,
        epochs=args.epochs,
        batch_size=args.batch,
        shuffle=True,
        validation_data=val_dataset,
        callbacks=[checkpoint_callback],
    )

    coders.autoencoder.save_weights(args.weights_path, overwrite=True)

def make_dataset(args: Settings, samples):
    # https://github.com/tensorflow/tensorflow/issues/35264#issuecomment-1363177995


    def generator_samples():

        # ADD SHUFFLING HERE?

        for idx in range(len(samples)):
            sample = samples[idx]
            sample_tensor = tf.convert_to_tensor(sample, dtype=tf.float32)
            yield sample_tensor, sample_tensor

    dataset = tf.data.Dataset.from_generator(
        generator_samples,
        output_signature=(
            tf.TensorSpec(shape=image_shape, dtype=tf.float32),
            tf.TensorSpec(shape=image_shape, dtype=tf.float32)
        )
    )
    return dataset.batch(args.batch)
