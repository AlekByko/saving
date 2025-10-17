import { KnownPickedDirRef } from '../shared/identities';

export interface KnownPickedDirEntry {
    name: KnownPickedDirRef;
    handle: FileSystemDirectoryHandle;
}

export const knownConfigsDirRef = 'base-dir' as KnownPickedDirRef;
export const knownSnapsDirRef = 'recorded-dir' as KnownPickedDirRef;
export const knownCapsDirRef = 'caps-dir' as KnownPickedDirRef;
export const knownNotesDirRef = 'notes-dir' as KnownPickedDirRef;
export const knownTrainingSetDirRef = 'known-training-set-dir' as KnownPickedDirRef;
export const knownOutputDirRef = 'output-dir' as KnownPickedDirRef;
export const knownEdConfigDirRef = 'config-dir' as KnownPickedDirRef;
export const knownArchiveDirRef = 'archive-dir' as KnownPickedDirRef;
export const knownMatesDirRef = 'pairs-dir' as KnownPickedDirRef;
export const knownFacesDirRef = 'faces-dir' as KnownPickedDirRef;
export const knownVidsDirRef = 'vids-dir' as KnownPickedDirRef;
