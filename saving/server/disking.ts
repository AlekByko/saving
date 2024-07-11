import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';

export interface DirFile {
    dir: string;
    path: string;
    name: string;
}

export function filterDir(
    dir: string,
    seeIfShouldKeep: (path: string, name: string) => boolean,
): DirFile[] {
    const all = readdirSync(dir);
    const result: DirFile[] = [];
    for (let index = 0; index < all.length; index++) {
        const name = all[index];
        const path = join(dir, name)
        const shouldKeep = seeIfShouldKeep(path, name);
        if (!shouldKeep) continue;
        const file: DirFile = { dir, name, path };
        result.push(file);
    }
    return result;
}

export function filterFilesInDir(dir: string): DirFile[] {
    return filterDir(dir, path => !lstatSync(path).isDirectory());
}

export function removeFileExtension(fileName: string) {
    return fileName.replace(/\.[^/.]+$/, '');
}
