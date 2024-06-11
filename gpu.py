
from numba import cuda


def reset_gpu():
    device = cuda.get_current_device()
    print(device)
    device.reset()
