from fastapi import FastAPI
import subprocess
import json
from random import Random
from pydantic import BaseModel
import sys
sys.path.append('W:\\ComfyUI_ENV\\custom_nodes')
from strip_comments_by_line import process #(text, counter: int, rand: Random):


def get_video_metadata(video_path: str, metadata_tag: str):
    cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format_tags=' + metadata_tag,
        '-of', 'default=noprint_wrappers=1:nokey=1',
        video_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    data = result.stdout
    return data


app = FastAPI()

class VideoLocation(BaseModel):
    video_dirpath: str
    video_filename: str
    metadata_tag: str

@app.post("/workflow")
async def read_workflow(location: VideoLocation):
    print(location)
    video_path = location.video_dirpath + '/' + location.video_filename
    data = get_video_metadata(video_path, location.metadata_tag)
    return data

class TemplateSetup(BaseModel):
    template: str
    seed: int

# how to run:
#   uvicorn vids_api:app --reload --port 8087
