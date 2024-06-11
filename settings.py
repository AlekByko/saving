import argparse
import glob
from typing import Any, Generator


def read_settings():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=str)
    parser.add_argument("--mode", type=str)
    parser.add_argument("--sample-size", type=int)
    parser.add_argument("--weights-path", type=str)
    parser.add_argument("--image-path", type=str)
    parser.add_argument("--config-path", type=str)
    parser.add_argument("--epochs", type=int)
    args = parser.parse_args()
    settings = Settings(args)
    return settings

class Snap:
    def __init__(self, path):
        self.path = path

    @property
    def config_path(self):
        return self.path + ".json"

    @property
    def image_path(self):
        return self.path + ".jpg"

def make_snaps(pattern: str) -> Generator[Any, Snap, None]:
    pathes: list[str] = glob.glob(pattern)
    # print(pattern)
    # print(pathes)
    for path in pathes:
        if path.endswith('.json'):
            clear_path = path.replace('.json', '')
            yield Snap(clear_path)

class Settings:
    def __init__(self, args):
        self.args = args

    @property
    def snaps(self) -> Generator[Snap, Any, None]:
        pattern = self.args.path

        if pattern.find(".") > 0:
            raise Exception(f"Bad path: {pattern}")

        return make_snaps(pattern)

    @property
    def weights_path(self):
        weights_path = self.args.weights_path
        if weights_path is None:
            raise Exception("No weights path.")
        return weights_path

    @property
    def image_path(self):
        image_path = self.args.image_path
        if image_path is None:
            raise Exception("No image path.")
        return image_path

    @property
    def config_path(self):
        config_path = self.args.config_path
        if config_path is None:
            raise Exception("No config path.")
        return config_path

    @property
    def mode(self) -> str:
        return self.args.mode

    @property
    def sample_size(self) -> int:
        return self.args.sample_size

    @property
    def epochs(self) -> int:
        return self.args.epochs
