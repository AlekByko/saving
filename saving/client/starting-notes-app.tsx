import React from 'react';
import ReactDOM from 'react-dom';
import { isNull, isUndefined } from '../shared/core';
import { makeChordOfKeyboardEvent } from './chording-keyboard-events';
import { knownNotesDirRef } from './file-system-entries';
import { thusJsonDrop } from './json-drop';
import { willOpenKnownDb } from './known-database';
import { NotesAppProps, thusNotesApp } from './notes-app';
import { NotesGlob } from './notes-glob';
import { defaultizeNotesWorkspaceConfig, NotesWorkspaceConfig } from './notes-workspace';
import { readAndSetAppTitle } from './reading-and-setting-app-title';
import { readPathFromQueryStringOr } from './reading-query-string';
import { willClaimDir } from './setting-up-notes-app';

async function run() {
    const db = await willOpenKnownDb();

    readAndSetAppTitle();

    const workspacePath = readPathFromQueryStringOr('workspace', null);
    if (isNull(workspacePath)) return alert(`No workspace path.`);
    console.log({ workspacePath });

    const rootElement = document.getElementById('root')!;
    const notesDir = await willClaimDir(db, rootElement, knownNotesDirRef);

    const droppedWorkspaceOrNot = await thusJsonDrop<Partial<NotesWorkspaceConfig>>({
        makeDefault: () => {
            return { notes: [], x: 0, y: 0, keybindings: [] } satisfies NotesWorkspaceConfig;
        }
    }).willTryMake(notesDir, workspacePath);
    if (isNull(droppedWorkspaceOrNot)) return alert(`No workspace at: ${workspacePath}`);
    const droppedWorkspace = droppedWorkspaceOrNot;

    const workspace = droppedWorkspace.data;
    defaultizeNotesWorkspaceConfig(workspace);
    const keybindingByChord = workspace.keybindings.toMap(x => x.chord, x => x, newer => newer);

    const workspaceDir = droppedWorkspace.dir;
    async function onChangedWorkspace() {
        droppedWorkspace.willSave(workspace);
    }

    const glob: NotesGlob = { db };
    const props: NotesAppProps = { workspace, workspaceDir, glob, onChangedWorkspace };
    const NotesApp = thusNotesApp({
        makeInsert: e => {
            const chord = makeChordOfKeyboardEvent(e);
            const keybinding = keybindingByChord.get(chord);
            if (isUndefined(keybinding)) return null;
            e.preventDefault();
            e.stopPropagation();
            const node = document.createTextNode(keybinding.text);
            return node;
        }
    });
    ReactDOM.render(<NotesApp {...props} />, rootElement)
}

if (window.sandbox === 'starting-notes-app') {
    run();
}
