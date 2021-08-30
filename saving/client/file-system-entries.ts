import { As } from './shared/core';

export type FileSystemEntryName = string & As<'file-system-entry-name'>;
export interface FileSystemEntry {
    name: FileSystemEntryName;
    handle: FileSystemHandle;
}
export const knownBaseDirEntryName = 'base-dir' as FileSystemEntryName;
