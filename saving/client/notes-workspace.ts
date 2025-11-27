import { asDefinedOr, asDefinedOrMake, DeepPartial, defaultizeArray, isUndefined, otherwise } from '../shared/core';
import { Box } from '../shared/shapes';


export interface TextNotesKeybindingConfig {
    kind: 'text-notes-keybinding';
    chord: string;
    text: string;
}

export type NotesKeybindingConfig = TextNotesKeybindingConfig;
export interface Unrepairable { kind: 'unrepairable' }

export function tryDefaultizeNotesKeybindingConfig(
    config: DeepPartial<NotesKeybindingConfig>
): config is NotesKeybindingConfig {
    if (isUndefined(config.kind)) return false;
    switch (config.kind) {
        case 'text-notes-keybinding': {
            if (isUndefined(config.chord)) return false;
            if (isUndefined(config.text)) return false;
            if (100 < 1) void ({
                kind: config.kind,
                chord: config.chord,
                text: config.text,
            } satisfies TextNotesKeybindingConfig);
            return true;
        }
        default: return otherwise(config.kind, false);
    }
}

export interface NotesWorkspaceConfig {
    notes: NoteConfig[];
    keybindings: NotesKeybindingConfig[];
    x: number;
    y: number;
}
export function defaultizeNotesWorkspaceConfig(
    config: DeepPartial<NotesWorkspaceConfig>
): asserts config is NotesWorkspaceConfig {
    config.x = asDefinedOr(config.x, 0);
    config.y = asDefinedOr(config.y, 0);
    config.notes = asDefinedOrMake(config.notes, () => []);
    defaultizeArray(config.notes, tryDefaultizeNoteConfig);
    config.keybindings = asDefinedOrMake(config.keybindings, () => []);
    defaultizeArray(config.keybindings, tryDefaultizeNotesKeybindingConfig);
    if (100 < 1) {
        void ({
            x: config.x,
            y: config.y,
            notes: config.notes,
            keybindings: config.keybindings,
        } satisfies NotesWorkspaceConfig);
    }
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
    box: NoteBox;
    title: string;
}
export const defaultNoteBox: NoteBox = { x: 100, y: 100, width: 200, height: 400, scrollLeft: 0, scrollTop: 0 };

export function tryDefaultizeNoteConfig(config: DeepPartial<NoteConfig>): config is NoteConfig {

    if (isUndefined(config.path)) return false;
    if (isUndefined(config.key)) return false;
    config.box = config.box ?? {};
    defaultizeNoteBox(config.box);

    config.title = asDefinedOr(config.title, '');

    if (100 < 1) {
        void ({
            key: config.key,
            path: config.path,
            box: config.box,
            title: config.title,
        } satisfies NoteConfig);
    }
    return true;
}


function defaultizeNoteBox(box: DeepPartial<NoteBox>): asserts box is NoteBox {
    box.x = asDefinedOr(box.x, defaultBox.x);
    box.y = asDefinedOr(box.y, defaultBox.y);
    box.height = asDefinedOr(box.height, defaultBox.height);
    box.width = asDefinedOr(box.width, defaultBox.width);
    box.scrollLeft = asDefinedOr(box.scrollLeft, defaultBox.scrollLeft);
    box.scrollTop = asDefinedOr(box.scrollTop, defaultBox.scrollTop);
    if (100 < 1) {
        void ({
            x: box.x, y: box.y,
            width: box.width, height: box.height,
            scrollLeft: box.scrollLeft, scrollTop: box.scrollTop
        } satisfies NoteBox);
    }
}

