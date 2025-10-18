from fastapi import FastAPI
import subprocess
import json
from pydantic import BaseModel


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
async def read_item(location: VideoLocation):
    print(location)
    video_path = location.video_dirpath + '/' + location.video_filename
    data = get_video_metadata(video_path)
    return data

if __name__ == "__main__":
    data = get_video_metadata('W:/ComfyUI_ENV/output/video/ComfyUI_00031_.mp4 ')
    print(data)

# how to run:
#   uvicorn vids_api:app --reload --port 8080
