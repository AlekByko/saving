python start.py ^
    --mode train-from-snaps ^
    --weights-path %1.hdf5 ^
    --path %1* ^
    --epochs 120 ^
    --batch 4 ^
    --train-val-spit-at 0.90 ^
    --latent-dim 64
