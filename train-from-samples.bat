python start.py ^
    --mode train-from-samples ^
    --weights-path %1.hdf5 ^
    --samples-dir %1 ^
    --max-samples 6000 ^
    --epochs 120 ^
    --batch 4 ^
    --train-val-spit-at 0.90 ^
    --latent-dim 64
