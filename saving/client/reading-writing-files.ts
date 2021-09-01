import { willFindAllInStoreOf, willPutAllToStoreOf } from "./databasing";
import { FileSystemEntry, FileSystemEntryName } from "./file-system-entries";
import { knownDbStores } from "./known-settings";
import { isNonNull, isNull } from './shared/core';

// https://web.dev/file-system-access/

export async function willLoadOrPickAndSaveTaggedImagesDirectory(
    db: IDBDatabase, name: FileSystemEntryName,
): Promise<FileSystemDirectoryHandle | null> {
    const loaded = await willTryLoadTaggedImagesDirectory(db, name);
    if (isNonNull(loaded)) return loaded;
    const picked = await willPickAndSaveTaggedImagesDirectory(db, name);
    return picked;
}

export async function willTryLoadTaggedImagesDirectory(
    db: IDBDatabase, name: FileSystemEntryName,
): Promise<FileSystemDirectoryHandle | null> {
    const { fs } = knownDbStores;
    const found = await willFindAllInStoreOf<typeof fs.T>(
        db, fs.storeName,
        entry => entry.name === name,
    );
    if (found.length < 1) return null;
    const [first] = found;
    const { handle } = first;
    if (handle.kind !== 'directory') return null;
    return handle;
}

export async function willPickAndSaveTaggedImagesDirectory(
    db: IDBDatabase, name: FileSystemEntryName,
): Promise<FileSystemDirectoryHandle> {
    const handle = await window.showDirectoryPicker();
    const { fs } = knownDbStores;
    const entry: FileSystemEntry = { name, handle };
    const entries = [entry];
    await willPutAllToStoreOf<typeof fs.T>(db, entries, fs.storeName);
    return handle;
}

export async function checkIfPermitted(handle: FileSystemHandleBase, mode: FileSystemPermissionMode) {
    let permission = await handle.queryPermission({ mode });
    if (permission === 'granted') return true;
    permission = await handle.requestPermission({ mode });
    if (permission !== 'granted') return false;
    return true;
}

export async function willTryGetDirDeep(baseDir: FileSystemDirectoryHandle | null, names: string[]): Promise<FileSystemDirectoryHandle | null> {
    let at = baseDir;
    if (isNull(at)) return null;

    for (const name of names) {
        at = await tryGetDir(at, name);
        if (isNull(at)) return null;
    }

    return at;
}
export async function tryGetDir(baseDir: FileSystemDirectoryHandle | null, name: string): Promise<FileSystemDirectoryHandle | null> {
    if (isNull(baseDir)) return null;
    if (!await checkIfPermitted(baseDir, 'readwrite')) return null;

    const handle = await baseDir.getDirectoryHandle(name);
    if (isNull(handle)) return null;
    if (!await checkIfPermitted(handle, 'readwrite')) return null;

    return handle;
}
const createOption: GetFileHandleOptions = { create: true };

export async function willTrySaveFile(
    baseDir: FileSystemDirectoryHandle | null,
    name: string,
    text: string | Blob,
    shouldCreate: boolean
): Promise<'ok' | null> {
    if (isNull(baseDir)) return null;
    if (!await checkIfPermitted(baseDir, 'readwrite')) return null;

    const file = await baseDir.getFileHandle(name, shouldCreate ? createOption : undefined);
    if (isNull(file)) return null;
    if (!await checkIfPermitted(file, 'readwrite')) return null;

    const writable = await file.createWritable();
    await writable.write(text);
    await writable.close();
    return 'ok';
}
