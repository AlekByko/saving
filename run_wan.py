import sys, os
sys.path.insert(0, "W:/ComfyUI/resources/ComfyUI") # parent dir for "comfy"
import comfy
import comfy.sd
import torch
from typing import NewType


def make_model_options():
    model_options = {}
    # default do nothing
    # weight_dtype == "fp8_e4m3fn":
    #   model_options["dtype"] = torch.float8_e4m3fn
    # weight_dtype == "fp8_e4m3fn_fast":
    #   model_options["dtype"] = torch.float8_e4m3fn
    #   model_options["fp8_optimizations"] = True
    # weight_dtype == "fp8_e5m2":
    #   model_options["dtype"] = torch.float8_e5m2
    return model_options


# --- config ---
diffuse_models_dir = "W:/ComfyUI_ENV/models/diffusion_models"
hn_name = "wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors"
ln_name = "wan2.2_t2v_low_noise_14B_fp8_scaled.safetensors"

# --- nominal opaque type ---
UnetModel = NewType("UnetModel", object)

# --- loader ---
def load_unet(unet_name: str) -> UnetModel:
    model_options = make_model_options()
    unet_path = f"{diffuse_models_dir}/{unet_name}"
    model = comfy.sd.load_diffusion_model(unet_path, model_options=model_options)
    return UnetModel(model)

# --- usage ---
hn_model = load_unet(hn_name)
ln_model = load_unet(ln_name)

