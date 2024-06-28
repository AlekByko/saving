python start.py ^
    --mode train-from-samples ^
    --weights-path d:\___samples\vae_320x240_weights_{epoch:02d}_{val_loss:.5f}.h5 ^
    --samples-dir d:\___samples\320x240\ ^
    --max-samples 200000 ^
    --epochs 120 ^
    --batch 16 ^
    --train-val-spit-at 0.90
