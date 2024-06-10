import json


class Tile:
    def __init__(self, config):
        self.second = config["second"]
        self.x = config["x"]
        self.y = config["y"]
        self.col = config["col"]
        self.row = config["row"]
        self.width = config["width"]
        self.height = config["height"]
        self.data = config


class Config:
    def __init__(self, data) -> None:
        self.data = data
        tiles: list[Tile] = []
        for config in data["caps"]:
            tile = Tile(config)
            tiles.append(tile)
        self.tiles = tiles


def load_config(path):
    with open(path, "r") as file:
        data = json.load(file)
        return Config(data)


def save_config(path, config: Config):
    with open(path, "w") as file:
        json.dump(config.data, file, indent=4)
