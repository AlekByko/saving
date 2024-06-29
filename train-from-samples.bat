python start.py ^
    --mode train-from-samples ^
    --weights-path W:\results\weights_{epoch:02d}_{loss:.5f}_{val_loss:.5f}.h5 ^
    --samples-dir W:\160x120xGray\ ^
    --max-samples 1000000 ^
    --epochs 120 ^
    --batch 32 ^
    --train-val-spit-at 0.90
