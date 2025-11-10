import { alwaysTrue, broke, fail, isNull } from '../shared/core';
import { KnownPickedDirRef } from '../shared/identities';
import { willFindAllInStoreOf, willPutAllToStoreOf } from "./databasing";
import { KnownPickedDirEntry } from "./file-system-entries";
import { JsonDrop } from './json-drop';
import { knownDbStores } from "./known-settings";

// https://web.dev/file-system-access/
export async function willTryGetAllDirsFromDb(db: IDBDatabase): Promise<KnownPickedDirEntry[]> {
    const { dirs } = knownDbStores;
    const found = await willFindAllInStoreOf<typeof dirs.T, {}>(
        db, dirs.storeName, alwaysTrue, {}, store => {
            return store.openCursor();
        }
    );
    return found;
}
export async function willTryLoadDirRef(
    db: IDBDatabase,
    ref: KnownPickedDirRef,
): Promise<FileSystemDirectoryHandle | null> {
    const { dirs } = knownDbStores;
    const found = await willFindAllInStoreOf<typeof dirs.T, {}>(
        db, dirs.storeName,
        entry => entry.name === ref,
        {}, store => {
            return store.openCursor();
        }
    );
    if (found.length < 1) return null;
    const [first] = found;
    const { handle } = first;
    if (handle.kind !== 'directory') return null;
    return handle;
}



export async function willSaveDirRef(
    ref: KnownPickedDirRef,
    handle: FileSystemDirectoryHandle,
    db: IDBDatabase
): Promise<void> {
    const { dirs } = knownDbStores;
    const entry: KnownPickedDirEntry = { name: ref, handle };
    const entries = [entry];
    await willPutAllToStoreOf<typeof dirs.T>(db, entries, dirs.storeName);
}

export async function willCheckIfPermitted(
    handle: FileSystemHandle,
    mode: FileSystemPermissionMode
): Promise<boolean> {
    let permission = await handle.queryPermission({ mode });
    if (permission === 'granted') return true;
    permission = await handle.requestPermission({ mode });
    if (permission !== 'granted') return false;
    return true;
}

export async function willTryGetDirDeepSlowChecks(
    baseDir: FileSystemDirectoryHandle | null,
    path: string[]
): Promise<FileSystemDirectoryHandle | null> {
    let at = baseDir;
    if (isNull(at)) return null;

    for (const name of path) {
        at = await willTryGetDir(at, name);
        if (isNull(at)) return null;
    }

    return at;
}
export async function willTryGetDir(
    baseDir: FileSystemDirectoryHandle | null,
    name: string,
): Promise<FileSystemDirectoryHandle | null> {
    if (isNull(baseDir)) return null;
    if (!await willCheckIfPermitted(baseDir, 'readwrite')) return null;

    const handle = await baseDir.getDirectoryHandle(name, createOption);
    if (isNull(handle)) return null;
    if (!await willCheckIfPermitted(handle, 'readwrite')) return null;

    return handle;
}


export async function willTryGetDirDeepFastNoChecks(
    baseDir: FileSystemDirectoryHandle | null,
    path: string[]
): Promise<FileSystemDirectoryHandle | null> {
    let at = baseDir;
    if (isNull(at)) return null;

    for (const name of path) {
        at = await willTryGetDirFastNoChecks(at, name);
        if (isNull(at)) return null;
    }

    return at;
}
export async function willTryGetDirFastNoChecks(
    baseDir: FileSystemDirectoryHandle | null,
    name: string,
): Promise<FileSystemDirectoryHandle | null> {
    if (isNull(baseDir)) return null;

    const handle = await baseDir.getDirectoryHandle(name, createOption);
    if (isNull(handle)) return null;

    return handle;
}
const createOption: GetFileHandleOptions = { create: true };

export async function willTrySaveFile(
    baseDir: FileSystemDirectoryHandle | null,
    name: string,
    text: string | Blob,
    shouldCreate: boolean
): Promise<boolean> {
    const file = await willGetFileHandlePermittedOr(baseDir, name, shouldCreate, null);
    if (isNull(file)) return false;
    await willSaveFile(file, text);
    return true;
}

export async function willGetFileHandlePermittedOr<Or>(
    baseDir: FileSystemDirectoryHandle | null,
    name: string,
    shouldCreate: boolean,
    or: Or,
) {
    if (isNull(baseDir)) return or;
    if (!await willCheckIfPermitted(baseDir, 'readwrite')) return or;

    const file = await willTryGetFile(baseDir, name, shouldCreate);
    if (isNull(file)) return or;
    if (!await willCheckIfPermitted(file, 'readwrite')) return or;

    return file;
}

export async function willTryGetFile(
    dir: FileSystemDirectoryHandle,
    name: string,
    shouldCreate: boolean,
): Promise<FileSystemFileHandle | null> {
    const options = shouldCreate ? createOption : undefined;
    try {
        return await dir.getFileHandle(name, options);
    } catch (e) {
        return null; // <-- file is not there
    }
}

export async function willOpenJsonFile<T = any>(
    dir: FileSystemDirectoryHandle,
    name: string,
): Promise<T | null> {
    const handle = await willTryGetFile(dir, name, false);
    if (isNull(handle)) return null;
    const file = await handle.getFile();
    const json = await file.text();
    return JSON.parse(json);
}



export async function willSaveFile(
    file: FileSystemFileHandle,
    stuff: string | Blob,
): Promise<void> {
    const writable = await file.createWritable();
    await writable.write(stuff);
    await writable.close();
}



export async function willPickAndSaveDirRef(
    db: IDBDatabase,
    ref: KnownPickedDirRef,
): Promise<FileSystemDirectoryHandle> {
    const handle = await window.showDirectoryPicker();
    await willSaveDirRef(ref, handle, db);
    return handle;
}
export function assertIsFileSystemFileHandle(handle: FileSystemHandle): asserts handle is FileSystemFileHandle {
    if (handle.kind === 'file') return;
    debugger;
    return fail('Expected to be a file.');
}

export function assertIsFileSystemDirectoryHandle(handle: FileSystemHandle): asserts handle is FileSystemDirectoryHandle {
    if (handle.kind === 'directory') return;
    debugger;
    return fail('Expected to be a directory.');
}

export async function willGetFileHandleOr<Or>(dir: FileSystemDirectoryHandle, name: string, or: Or) {
    try {
        return await dir.getFileHandle(name);
    } catch {
        return or;
    }
}
export async function willGetDirHandleOr<Or>(dir: FileSystemDirectoryHandle, name: string, or: Or) {
    try {
        return await dir.getDirectoryHandle(name);
    } catch {
        return or;
    }
}

export async function willReadAllFileHandles(dir: FileSystemDirectoryHandle) {
    const files: FileSystemFileHandle[] = [];
    for await (const handle of dir.values()) {
        switch (handle.kind) {
            case 'directory': {
                continue;
            }
            case 'file': {
                files.push(handle as FileSystemFileHandle);
                continue;
            }
            default: return broke(handle.kind);
        }
    }
    return files;
}

export function seeIfDirectory(entry: FileSystemHandle): entry is FileSystemDirectoryHandle {
    return entry.kind === 'directory';
}
export function seeIfFile(entry: FileSystemHandle): entry is FileSystemFileHandle {
    return entry.kind === 'file';
}
export async function willMoveFiles(sourceDir: FileSystemDirectoryHandle, targetDir: FileSystemDirectoryHandle) {
    for await (const entry of sourceDir.values()) {
        if (!seeIfFile(entry)) continue;
        entry.move(targetDir);
    }
}

export async function willMakeJsonDrop<Json extends object>(
    dir: FileSystemDirectoryHandle,
    path: string
) {
    const [fileName, ...subdirsNames] = path.split(/[\\/]/g).map(x => x.trim()).filter(x => x).reverse();
    subdirsNames.reverse();
    const fileDir = await willTryGetDirDeepFastNoChecks(dir, subdirsNames);
    if (isNull(fileDir)) return (alert(`No dir at: ${subdirsNames.join('/')}`), null);
    const fileHandle = await willGetFileHandleOr(fileDir, fileName, null);
    if (isNull(fileHandle)) return (alert(`No file at: ${subdirsNames.join('/')} ${fileName}`), null);
    const drop = new JsonDrop<Json>(fileHandle);
    return drop;
}
