import { closeSync, lstatSync, openSync, readdirSync } from 'fs';
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

export function combinePath(path1: string, path2: string): string {
    return join(path1, path2).replace(/\\/g, '/')
}

export function seeIfBeingWrittenTo(path: string): boolean {
    try {
        const fd = openSync(path, 'r+');
        closeSync(fd);
        return false;
    } catch (err: any) {
        if (err.code === 'EBUSY' || err.code === 'EACCES' || err.code === 'EPERM') {
            return true;
        } else {
            return true;
        }
    }
}

export function forceBackslashes(text: string): string {
    return text.replace(/\//ig, '\\');
}
