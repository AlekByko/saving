from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id):
    return {"item_id": item_id}



class Tile(BaseModel):
    snapsDirPath: str

@app.post("/tile")
async def tile_face(tile: Tile):
    print(f'Path: {tile.snapsDirPath}')
    return tile
