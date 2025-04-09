import child from 'child_process';
import * as fs from 'fs';
import { join } from 'path';
import { broke, fix } from '../shared/core';

export interface DirFile {
    dir: string;
    path: string;
    name: string;
}

export function filterDir(
    dir: string,
    seeIfShouldKeep: (path: string, name: string) => boolean,
): DirFile[] {
    const all = fs.readdirSync(dir);
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
    return filterDir(dir, path => !fs.lstatSync(path).isDirectory());
}

export function removeFileExtension(fileName: string) {
    return fileName.replace(/\.[^/.]+$/, '');
}

export function combinePath(path1: string, path2: string): string {
    return join(path1, path2).replace(/\\/g, '/')
}


export function moveFile(filePath: string, targetPath: string, isDryRun: boolean) {
    if (isDryRun) return fix({ kind: 'dry-run-nothing-copied' });
    try {
        if (fs.existsSync(targetPath)) {
            return fix({ kind: 'target-file-exists' });
        }
    }
    catch (e: any) {
        console.log(`Unable to check if the target ${targetPath} for the source ${filePath} already exists. Unexpected error.`);
        console.log(e);
        return fix({ kind: 'unexpected-error', e });
    }

    try {
        fs.renameSync(filePath, targetPath);
        const stats = fs.statSync(targetPath, {});
        return fix({ kind: 'moved', size: stats.size });
    } catch (e: any) {
        if (e.code === 'ENOSPC') {
            return fix({ kind: 'no-space-left' });
        } else {
            console.log(`Unable to move ${filePath} to ${targetPath}. Unexpected error.`);
            console.log(e);
            return fix({ kind: 'unexpected-error', e });
        }
    }
}



export function copyFile(filePath: string, targetPath: string, isDryRun: boolean) {
    if (isDryRun) return fix({ kind: 'dry-run-nothing-copied' });
    try {
        if (fs.existsSync(targetPath)) {
            return fix({ kind: 'target-file-exists' });
        }
    }
    catch (e: any) {
        console.log(`Unable to check if the target ${targetPath} for the source ${filePath} already exists. Unexpected error.`);
        console.log(e);
        return fix({ kind: 'unexpected-error', e });
    }

    try {
        fs.copyFileSync(filePath, targetPath);
        const stats = fs.statSync(targetPath, {});
        return fix({ kind: 'copied', size: stats.size });
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
        const flags = fs.constants.O_RDONLY | 0x10000000 // <- UV_FS_O_EXLOCK;
        const fd = fs.openSync(path, flags);
        fs.closeSync(fd);
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

export function asWindowsPath(path: string): string {
    return path.replace(/\//ig, '\\');
}

export function parseJsonOr<T, Or>(text: string, or: Or): T | Or {
    try {
        const json = JSON.parse(text) as T;
        return json;
    } catch {
        return or;
    }
}


export function parseJsonAs<T>(text: string) {
    try {
        const data = JSON.parse(text);
        return fix({ kind: 'json', data: data as T, });
    } catch (e) {
        return fix({ kind: 'bad-json', e });
    }
}

export function readTextFile(path: string) {
    if (!fs.existsSync(path)) return fix({ kind: 'file-does-not-exist', path });
    try {
        const text = fs.readFileSync(path, { encoding: 'utf-8' });
        return fix({ kind: 'file-read', text });
    } catch (e) {
        return fix({ kind: 'unable-to-read-file', e });
    }
}

export function readJsonFileAs<T>(path: string) {
    const read = readTextFile(path);
    switch (read.kind) {
        case 'file-read': break;
        case 'file-does-not-exist':
        case 'unable-to-read-file':
            return read;
        default: return broke(read);
    }
    const { text } = read;
    const parsed = parseJsonAs<T>(text);
    return parsed;
}


