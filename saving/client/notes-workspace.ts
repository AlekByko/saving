import { asDefinedOr, asDefinedOrMake, DeepPartial, defaultizeArray, fail, isUndefined, sureNever } from '../shared/core';
import { Box } from '../shared/shapes';


export interface TextNotesKeybindingConfig {
    kind: 'text-notes-keybinding';
    chord: string;
    text: string;
}

export type NotesKeybindingConfig = TextNotesKeybindingConfig;
export interface Unrepairable { kind: 'unrepairable' }

export function defaultizeNotesKeybindingConfig(
    config: DeepPartial<NotesKeybindingConfig> | Unrepairable
): asserts config is NotesKeybindingConfig | Unrepairable {
    const unrepairable = config as Unrepairable;
    switch (config.kind) {
        case 'text-notes-keybinding': {
            if (isUndefined(config.chord)) {
                unrepairable.kind = 'unrepairable';
                return;
            }
            if (isUndefined(config.text)) {
                unrepairable.kind = 'unrepairable';
                return;
            }
            if (100 < 1) void ({
                kind: config.kind,
                chord: config.chord,
                text: config.text,
            } satisfies TextNotesKeybindingConfig);
            break;
        }
        case undefined:
        case 'unrepairable': {
            unrepairable.kind = 'unrepairable';
            break;
        }
        default: {
            sureNever(config);
            unrepairable.kind = 'unrepairable'
            break;
        }
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
    defaultizeArray(config.notes, defaultizeNoteConfig);
    config.keybindings = asDefinedOrMake(config.keybindings, () => []);
    defaultizeArray(config.keybindings, defaultizeNotesKeybindingConfig);
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
const defaultBox: NoteBox = { x: 100, y: 100, width: 200, height: 400, scrollLeft: 0, scrollTop: 0 };

export function defaultizeNoteConfig(config: DeepPartial<NoteConfig>): asserts config is NoteConfig {

    if (isUndefined(config.path)) return fail('No path in note.');
    config.key = asDefinedOrMake(config.key, makeNoteKey);
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

