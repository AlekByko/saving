import child from 'child_process';
import * as fs from 'fs';
import { join } from 'path';
import { bad, broke, cast, fail, fix, ok, unableOver } from '../shared/core';

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


export function renamePath(filePath: string, targetPath: string, isDryRun: boolean) {
    if (isDryRun) return fix({ kind: 'dry-run-nothing-copied' });
    try {
        if (fs.existsSync(targetPath)) {
            return fix({ kind: 'target-file-exists' });
        }
    }
    catch (err: any) {
        console.log(`Unable to check if the target ${targetPath} for the source ${filePath} already exists. Unexpected error.`);
        console.log(err);
        return fix({ kind: 'unexpected-error', err });
    }

    try {
        fs.renameSync(filePath, targetPath);
        const stats = fs.statSync(targetPath, {});
        return fix({ kind: 'renamed', size: stats.size });
    } catch (err: any) {
        if (err.code === 'ENOSPC') {
            return fix({ kind: 'no-space-left' });
        } else {
            console.log(`Unable to move ${filePath} to ${targetPath}. Unexpected error.`);
            console.log(err);
            return fix({ kind: 'unexpected-error', err });
        }
    }
}



export function copyFile(sourcePath: string, targetPath: string, isDryRun: boolean) {
    if (isDryRun) return fix({ kind: 'dry-run-nothing-copied' });
    const args = { sourcePath, targetPath, isDryRun } as const;
    const unable = unableOver('unable-to-copy-file', args);
    const targetExists = fsCheckIfExists(targetPath);
    if (targetExists.isBad) return unable({ kind: 'unable-to-check-if-target-exists', why: targetExists });
    if (targetExists.isThere) {
        const targetStats = fsStat(targetExists);
        if (targetStats.isBad) return unable({ kind: 'unable-to-stat-target', why: targetStats });
        if (targetStats.isFile) return fix({ ...args, ...ok, kind: 'target-file-exists' });
        return unable({ kind: 'target-exists-but-not-file', why: targetStats });
    }

    try {
        fs.copyFileSync(sourcePath, targetPath);
        const stats = fs.statSync(targetPath, {});
        return fix({ kind: 'copied', size: stats.size });
    } catch (err: any) {
        if (err.code === 'ENOSPC') {
            return fix({ kind: 'no-space-left' });
        } else {
            console.log(`Unable to copy ${sourcePath} to ${targetPath}. Unexpected error.`);
            console.log(err);
            return fix({ kind: 'unexpected-error', err });
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
    const args = { text } as const;
    try {
        const data = JSON.parse(text);
        return fix({ ...args, ...ok, kind: 'json-parsed', data: data as T, });
    } catch (e) {
        return fix({ ...args, ...bad, kind: 'bad-json', e });
    }
}

export function readTextFile(path: string) {
    const args = { path } as const;
    if (!fs.existsSync(path)) return fix({ ...args, ...bad, kind: 'file-does-not-exist', path });
    try {
        const text = fs.readFileSync(path, { encoding: 'utf-8' });
        return fix({ ...args, ...ok, kind: 'file-read', text });
    } catch (err) {
        return fix({ ...args, ...bad, kind: 'unable-to-read-file', why: { kind: 'unexpected-error', err } });
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


declare const asFile: unique symbol;
export interface AsFile extends AsExists {
    'as-file': typeof asFile;
}
declare const asDir: unique symbol;
export interface AsDir extends AsExists {
    'as-dir': typeof asDir;
}
export function sureIsFile<Path extends string & AsExists>(path: Path, assertion: FsStat): asserts path is Path & AsFile {
    if (assertion.path !== path) {
        console.log({ path, assertion });
        return fail(`Unable to assert that "${path}" is a file. Assertion points at different path "${assertion.path}"`);
    }
    if (assertion.isBad) {
        console.log({ path, assertion });
        return fail(`Unable to assert that "${path}" is a file. Assertion is bad.`);
    }
    if (!assertion.stats.isFile()) {
        console.log({ path, assertion });
        return fail(`Unable to assert that "${path}" is a file, because it is not.`);
    }
}
export function fsStat(exists: { isOk: true, path: string & AsExists; isThere: true }) {
    return fsStat_(exists.path);
}
export function fsStat_(path: string & AsExists) {
    try {
        const stats = fs.statSync(path);
        if (stats.isFile()) {
            cast<typeof path & AsFile>(path);
            return fix({ path, ...ok, kind: 'path-statted', stats, isFile: true, isDir: false });
        } else if (stats.isDirectory()) {
            cast<typeof path & AsDir>(path);
            return fix({ path, ...ok, kind: 'path-statted', stats, isFile: false, isDir: true });
        } else {
            return fix({ path, ...ok, kind: 'path-statted', stats, isFile: false, isDir: false });
        }
    } catch (err: any) {
        return fix({ path, ...bad, kind: 'unable-to-stat-path', why: { kind: 'unexpected-error', err } });
    }
}
export type FsStat = ReturnType<typeof fsStat>;

declare const asExists: unique symbol;
export interface AsExists {
    'as-exists': typeof asExists;
}

export function sureExists(path: string, assertion: FsCheckIfExists): asserts path is string & AsExists {
    if (assertion.path !== path) {
        console.log({ path, assertion });
        return fail(`Unable to assert that "${path}" extists. Assertion points at different path "${assertion.path}"`);
    }
    if (assertion.isBad) {
        console.log({ path, assertion });
        return fail(`Unable to assert that "${path}" exists. Assertion is bad.`);
    }
    if (!assertion.isThere) {
        console.log({ path, assertion });
        return fail(`Unable to assert that "${path}" exists, because it does not.`);
    }
}

type FsCheckIfExists = ReturnType<typeof fsCheckIfExists>;
function fsCheckIfExists<Path extends string>(path: AsExists extends Path ? never : string) {
    try {
        const isThere = fs.existsSync(path);
        cast<typeof path & AsExists>(path);
        if (isThere) {
            return fix({ path, ...ok, kind: 'path-existence-checked', isThere: true });
        } else {
            return fix({ path, ...ok, kind: 'path-existence-checked', isThere: false });
        }
    } catch (err: any) {
        return fix({ path, ...bad, kind: 'unable-to-check-path-existence', why: { kind: 'unexpected-error', err } });
    }
}
