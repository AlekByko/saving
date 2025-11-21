import { asDefinedOr, isDefined } from '../shared/core';
import { Box } from '../shared/shapes';

export interface NotesWorkspace {
    notes: NoteConfig[];
    x: number;
    y: number;
}
export function defaultizeNotesWorkspace(workspace: Partial<NotesWorkspace>): asserts workspace is NotesWorkspace {
    workspace.notes = asDefinedOr(workspace.notes, []);
    workspace.x = asDefinedOr(workspace.x, 0);
    workspace.y = asDefinedOr(workspace.y, 0);
}

export type NoteKey = string & As<'note-key'>;
export function makeNoteKey(): NoteKey {
    return new Date().getTime() + "" as NoteKey;
}

export interface NoteBox extends Box {
    scrollLeft: number;
    scrollTop: number;
}
export interface NoteConfig {
    key: NoteKey;
    path: string;
    box?: Partial<NoteBox>;
    title?: string;
}
export function makeDefaultNoteBox(): NoteBox {
    return { x: 100, y: 100, width: 200, height: 400, scrollLeft: 0, scrollTop: 0 };
}
const defaultBox = makeDefaultNoteBox();
export function normalizeNoteConfig(config: NoteConfig) {
    let { key, path, title } = config;
    const box = config.box = isDefined(config.box) ? config.box : makeDefaultNoteBox();
    defaultizeNoteBox(box);

    title = asDefinedOr(title, path);
    return { key, title, box, path };
}


function defaultizeNoteBox(box: Partial<NoteBox>): asserts box is NoteBox {
    box.x = asDefinedOr(box.x, defaultBox.x);
    box.y = asDefinedOr(box.y, defaultBox.y);
    box.height = asDefinedOr(box.height, defaultBox.height);
    box.width = asDefinedOr(box.width, defaultBox.width);
    box.scrollLeft = asDefinedOr(box.scrollLeft, defaultBox.scrollLeft);
    box.scrollTop = asDefinedOr(box.scrollTop, defaultBox.scrollTop);
}

