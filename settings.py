import argparse



def read_settings():
    parser = argparse.ArgumentParser()
    parser.add_argument('--path', type=str, required=True)
    parser.add_argument('--width', type=int, required=True)
    parser.add_argument('--height', type=int, required=True)
    args = parser.parse_args()
    settins = Settings()
    settins.path = args.path
    settins.width = args.width
    settins.height = args.height

class Settings:
    def __init__(self):
        self.path = None
        self.width = None
        self.height = None
