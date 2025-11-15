import { KnownPickedDirRef } from './known-db-stores';

export interface KnownPickedDirEntry {
    name: KnownPickedDirRef;
    handle: FileSystemDirectoryHandle;
}

export const knownConfigsDirRef = 'base-dir' as KnownPickedDirRef;
export const knownNotesDirRef = 'notes-dir' as KnownPickedDirRef;
export const knownVidsDirRef = 'vids-dir' as KnownPickedDirRef;
