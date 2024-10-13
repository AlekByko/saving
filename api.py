import os

import cv2
import numpy as np
from face_sdk import Service
from face_sdk.modules.context import Context
from fastapi import FastAPI
from PIL import Image
from pydantic import BaseModel

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id):
    return {"item_id": item_id}


class Tile(BaseModel):
    imageFilePath: str
    x: int
    y: int
    width: int
    height: int


def fail(message):
    print(message)
    raise ValueError(message)


def read_sdk_path():
    open_face_sdk_path_param = "OPEN_FACE_SDK_PATH"
    path = os.getenv(open_face_sdk_path_param, None)
    if path is None:
        return fail(f"No {open_face_sdk_path_param} in ENV.")
    elif not os.path.exists(path):
        return fail(
            f"Open Face SDK path {path} via {open_face_sdk_path_param} does not exist."
        )
    else:
        return path


def make_sure_path_exist(path):
    if not os.path.exists(path):
        fail(f"Path {path} does not exist.")


@app.post("/tile")
async def tile_face(tile: Tile):
    image_path = tile.imageFilePath
    make_sure_path_exist(image_path)

    sdk_path = read_sdk_path()
    print("ok path")
    service = Service.create_service(sdk_path)
    print("ok service")
    face_detector = service.create_processing_block({"unit_type": "FACE_DETECTOR"})
    print("ok detector")

    image = cv2.imread(tile.imageFilePath) #, cv2.IMREAD_COLOR)
    print("ok image")
    whole_image: np.ndarray = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    print("ok whole image")

    tile_image = crop_cv_image(
        whole_image, tile.x, tile.y, tile.width, tile.height
    )
    print("ok tile image")

    imgCtx = {
        "dtype": "uint8_t",
        "format": "NDARRAY",
        "blob": tile_image.tobytes(),
        "shape": [dim for dim in tile_image.shape],
    }
    print("ok imgCtx")
    ioData = service.create_context({"image": imgCtx})
    print("ok ioData")
    face_detector(ioData)
    print("ok detection")

    read_all = read_obj(ioData)

    result = {"tile": tile, "whole_image_shape": image.shape, "objects": read_all}
    return result


def read_obj(obj: Context):
    if obj.is_none():
        return None
    if obj.is_string():
        return obj.get_value()
    if obj.is_double():
        return obj.get_value()
    if obj.is_long():
        return obj.get_value()
    if obj.is_bool():
        return obj.get_value()
    if obj.is_unsigned_long():
        return obj.get_value()
    if obj.is_array():
        all = list()
        for val in obj:
            one = read_obj(val)
            all.append(one)
        return all

    if obj.is_object():
        keys = obj.keys()
        all = {}
        for key in keys:
            all[key] = read_obj(obj[key])
        return all


def read_points(points):
    all = list()
    for point in points:
        one = {
            "x": point["x"].get_value(),
            "y": point["y"].get_value(),
        }
        all.append(one)
    return all


def read_box(box):
    result = {
        "x0": box[0].get_value(),
        "y0": box[1].get_value(),
        "x1": box[2].get_value(),
        "y1": box[3].get_value(),
    }
    return result


def pil_to_opencv(pil_image: Image.Image):
    opencv_image = np.array(pil_image)
    opencv_image = cv2.cvtColor(opencv_image, cv2.COLOR_RGB2BGR)
    return opencv_image


def opencv_to_pil(opencv_image):
    opencv_image = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(opencv_image)
    return pil_image


def crop_cv_image(cv_image, x_start, y_start, width, height):
    cropped_cv_image = cv_image[y_start : y_start + height, x_start : x_start + width, :]
    return cropped_cv_image
