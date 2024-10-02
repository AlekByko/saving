import child from 'child_process';
import { closeSync, copyFileSync, existsSync, lstatSync, openSync, readdirSync } from 'fs';
import { join } from 'path';
import { fix } from './shared/core';

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


export function copyFile(filePath: string, targetPath: string) {
    try {
        if (existsSync(targetPath)) {
            return fix({ kind: 'target-file-exists' });
        }
    }
    catch (e: any) {
        console.log(`Unable to check if the target ${targetPath} for the source ${filePath} already exists. Unexpected error.`);
        console.log(e);
        return fix({ kind: 'unexpected-error', e });
    }

    try {
        copyFileSync(filePath, targetPath);
        return fix({ kind: 'copied' });
    } catch (e: any) {
        if (e.code === 'ENOSPC') {
            return fix({ kind: 'no-space-left' });
        } else {
            console.log(`Unable to copy ${filePath} to ${targetPath}. Unexpected error.`);
            console.log(e);
            return fix({ kind: 'unexpected-error', e });
        }
    }
}

export function seeIfBeingWrittenTo(path: string): boolean {
    try {
        const fd = openSync(path, 'r+');
        closeSync(fd);
        return false;
    } catch (e: any) {
        if (e.code === 'EBUSY' || e.code === 'EACCES' || e.code === 'EPERM') {
            return true;
        } else {
            console.log(`Unable to check if ${path} is writable. Unexpected error.`);
            console.log(e);
            throw e;
        }
    }
}

export function forceBackslashes(text: string): string {
    return text.replace(/\//ig, '\\');
}


export function willBeDiskNames() {

    return new Promise<string[]>((resolve, reject) => {
        child.exec('wmic logicaldisk get name', (error, stdout) => {
            if (error) {
                reject(error);
            } else {
                const result = stdout.split('\r\r\n')
                    .filter(value => /[A-Za-z]:/.test(value))
                    .map(value => value.trim().replace(':', '').toLowerCase())
                resolve(result);
            }
        });
    });
}

