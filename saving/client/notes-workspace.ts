import { asDefinedOr } from '../shared/core';
import { BeingBox, Box, henceBeingBox } from '../shared/shapes';
import { makeSeed } from './randomizing';

export interface NotesWorkspace {
    notes: NoteConfig[];
}

export type NoteKey = string & As<'note-key'>;
export function makeNoteKey(): NoteKey {
    return makeSeed() + "" as NoteKey;
}

export interface NoteConfig {
    key: NoteKey;
    path: string;
    box?: Partial<Box>;
    title?: string;
}
const beingNoteBox: BeingBox = henceBeingBox({ x: 100, y: 100, width: 200, height: 400 });
export function normalizeNoteConfig(config: NoteConfig) {
    let { key, path, title } = config;
    const box = config.box = asDefinedOr(config.box, beingNoteBox.defaultBox);
    beingNoteBox.defaultize(box);
    beingNoteBox.roundize(box);
    title = asDefinedOr(title, path);
    return { key, title, box, path };
}


