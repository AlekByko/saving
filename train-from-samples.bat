python start.py ^
    --mode train-from-samples ^
    --weights-path d:\___samples\vae_160x120_weights_{epoch:02d}_{val_loss:.5f}.h5 ^
    --samples-dir d:\___samples\160x120\ ^
    --max-samples 1000000 ^
    --epochs 120 ^
    --batch 32 ^
    --train-val-spit-at 0.90
