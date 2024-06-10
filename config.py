import json
from typing import List



class Tile:
    def __init__(self, config):
        self.second = config['second']
        self.x = config['x']
        self.y = config['y']
        self.col = config['col']
        self.row = config['row']
        self.width = config['width']
        self.height = config['height']
        self.data = config

def load_config(path):
    with open(path, 'r') as file:
        data = json.load(file)
        for config in data['caps']:
            tile = Tile(config)
            yield tile

def save_config(path, tiles: List[Tile]):
    data = {
        'caps': list(map(lambda x: x.data, tiles))
    }
    with open(path, "w") as file:
        json.dump(data, file, indent=4)

