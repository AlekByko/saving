import { willFindAllInStoreOf, willPutAllToStoreOf } from "./databasing";
import { KnownPickedDirEntry, KnownPickedDirRef } from "./file-system-entries";
import { knownDbStores } from "./known-settings";
import { isNull } from './shared/core';

// https://web.dev/file-system-access/

export async function willTryGetDirectory(
    db: IDBDatabase,
    ref: KnownPickedDirRef,
): Promise<FileSystemDirectoryHandle | null> {
    const { dirs } = knownDbStores;
    const found = await willFindAllInStoreOf<typeof dirs.T>(
        db, dirs.storeName,
        entry => entry.ref === ref,
    );
    if (found.length < 1) return null;
    const [first] = found;
    const { handle } = first;
    if (handle.kind !== 'directory') return null;
    return handle;
}



export async function willSaveDirRef(ref: KnownPickedDirRef, handle: FileSystemDirectoryHandle, db: IDBDatabase) {
    const { dirs } = knownDbStores;
    const entry: KnownPickedDirEntry = { ref, handle };
    const entries = [entry];
    await willPutAllToStoreOf<typeof dirs.T>(db, entries, dirs.storeName);
    return handle;
}

export async function willCheckIfPermitted(handle: FileSystemHandleBase, mode: FileSystemPermissionMode) {
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
        at = await tryGetDir(at, name);
        if (isNull(at)) return null;
    }

    return at;
}
export async function tryGetDir(
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
): Promise<'ok' | null> {
    if (isNull(baseDir)) return null;
    if (!await willCheckIfPermitted(baseDir, 'readwrite')) return null;

    const file = await baseDir.getFileHandle(name, shouldCreate ? createOption : undefined);
    if (isNull(file)) return null;
    if (!await willCheckIfPermitted(file, 'readwrite')) return null;

    const writable = await file.createWritable();
    await writable.write(text);
    await writable.close();
    return 'ok';
}
