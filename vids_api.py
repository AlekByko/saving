from fastapi import FastAPI
import subprocess
import json
from random import Random
from pydantic import BaseModel
import sys
sys.path.append('W:\\ComfyUI_ENV\\custom_nodes')
from strip_comments_by_line import process #(text, counter: int, rand: Random):



def get_video_metadata(video_path: str):
    cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format_tags=workflow',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        video_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    # data = json.loads(result.stdout)
    data = result.stdout
    return data


app = FastAPI()

class VideoLocation(BaseModel):
    video_dirpath: str
    video_filename: str

@app.post("/workflow")
async def read_workflow(location: VideoLocation):
    print(location)
    video_path = location.video_dirpath + '/' + location.video_filename
    data = get_video_metadata(video_path)
    return data

class TemplateSetup(BaseModel):
    template: str
    seed: int

@app.post("/prompt")
def get_prompt(setup: TemplateSetup):
    rand = Random(setup.seed)
    prompt = process(setup.template, 0, rand)
    return prompt


if __name__ == "__main__":
    data = get_video_metadata('W:/ComfyUI_ENV/output/video/ComfyUI_00031_.mp4 ')
    print(data)

# how to run:
#   uvicorn vids_api:app --reload --port 8080
