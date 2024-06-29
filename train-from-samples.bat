python start.py ^
    --mode train-from-samples ^
    --weights-path W:\160x120xGray-2024-06-28-01\ae_160x120xGray_{epoch:02d}_{val_loss:.5f}.h5 ^
    --samples-dir W:\160x120xGray\ ^
    --max-samples 1000000 ^
    --epochs 120 ^
    --batch 32 ^
    --train-val-spit-at 0.90
