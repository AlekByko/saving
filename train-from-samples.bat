python start.py ^
    --mode train-from-samples ^
    --weights-path d:\___samples\320x240_weights_{epoch:02d}.h5 ^
    --samples-dir d:\___samples\320x240\ ^
    --max-samples 23300 ^
    --epochs 120 ^
    --batch 4 ^
    --train-val-spit-at 0.90
