import { As } from './shared/core';

export type KnownPickedDirRef = string & As<'known-picked-dir-ref'>;

export interface KnownPickedDirEntry {
    ref: KnownPickedDirRef;
    handle: FileSystemDirectoryHandle;
}

export const knownBaseDirRef = 'base-dir' as KnownPickedDirRef;
export const knownSnapsDirRef = 'recorded-dir' as KnownPickedDirRef;
