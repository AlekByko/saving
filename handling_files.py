import os
import shutil



def maybe_move_file(samples_dir: str, dir_name: str, path: str):
    dir_path = os.path.join(samples_dir, dir_name)
    file_name = os.path.basename(path)
    file_path = os.path.join(dir_path, file_name)
    if os.path.exists(file_path):
        return
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    shutil.move(path, dir_path)
