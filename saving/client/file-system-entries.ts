import { KnownPickedDirRef } from './shared/identities';

export interface KnownPickedDirEntry {
    name: KnownPickedDirRef;
    handle: FileSystemDirectoryHandle;
}

export const knownBaseDirRef = 'base-dir' as KnownPickedDirRef;
export const knownSnapsDirRef = 'recorded-dir' as KnownPickedDirRef;
