import { asDefinedOr } from '../shared/core';

export interface NotesWorkspace {
    notes: NoteConfig[];
}

export type NoteKey = string & As<'note-key'>;

export interface NoteConfig {
    key: NoteKey;
    path: string;
    x?: number;
    y?: number;
    title?: string;
}

export function defaultsSetNoteConfig(config: NoteConfig) {
    let { key, path, title, x, y } = config;
    x = asDefinedOr(x, 20);
    y = asDefinedOr(y, 20);
    title = asDefinedOr(title, path);
    return { key, title, x, y, path };
}


