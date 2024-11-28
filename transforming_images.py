import cv2
import numpy as np
from PIL import Image


def pil_to_opencv(pil_image: Image.Image):
    opencv_image = np.array(pil_image)
    opencv_image = cv2.cvtColor(opencv_image, cv2.COLOR_RGB2BGR)
    return opencv_image


def opencv_to_pil(opencv_image):
    opencv_image = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(opencv_image)
    return pil_image


def crop_cv_image(cv_image, x_start, y_start, width, height):
    cropped_cv_image = cv_image[
        y_start : y_start + height, x_start : x_start + width, :
    ]
    return cropped_cv_image
