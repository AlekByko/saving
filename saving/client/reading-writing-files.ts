import { willFindAllInStoreOf, willPutAllToStoreOf } from "./databasing";
import { KnownPickedDirEntry } from "./file-system-entries";
import { knownDbStores } from "./known-settings";
import { alwaysTrue, isNull } from './shared/core';
import { KnownPickedDirRef } from './shared/identities';

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
export async function willTryGetDirFromDb(
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

export async function willTryGetDirDeep(
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
const createOption: GetFileHandleOptions = { create: true };

export async function willTrySaveFile(
    baseDir: FileSystemDirectoryHandle | null,
    name: string,
    text: string | Blob,
    shouldCreate: boolean
): Promise<boolean> {
    if (isNull(baseDir)) return false;
    if (!await willCheckIfPermitted(baseDir, 'readwrite')) return false;

    const file = await willTryGetFile(baseDir, name, shouldCreate);
    if (isNull(file)) return false;
    if (!await willCheckIfPermitted(file, 'readwrite')) return false;

    await willSaveFile(file, text);
    return true;
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
