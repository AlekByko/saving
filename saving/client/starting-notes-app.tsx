import React from 'react';
import ReactDOM from 'react-dom';
import { isNonNull, isNull, isUndefined } from '../shared/core';
import { knownNotesDirRef } from './file-system-entries';
import { thusJsonDrop } from './json-drop';
import { willOpenKnownDb } from './known-database';
import { NoteProps } from './note';
import { NotesAppProps, thusNotesApp } from './notes-app';
import { NotesGlob } from './notes-glob';
import { normalizeNoteConfig, NoteKey, NotesWorkspace } from './notes-workspace';
import { Box, readPathFromQueryStringOr, readStringFromQueryStringOr } from './reading-query-string';
import { willClaimDir } from './setting-up-notes-app';
import { TextDrop } from './text-drop';

async function run() {
    const db = await willOpenKnownDb();

    const title = readStringFromQueryStringOr(/[?&]title=([-_\w\d]+)/ig, null);
    if (isNonNull(title)) {
        document.title = title;
    }

    const workspacePath = readPathFromQueryStringOr('workspace', null);
    if (isNull(workspacePath)) return alert(`No workspace path.`);
    console.log({ workspacePath });

    const rootElement = document.getElementById('root')!;
    const notesDir = await willClaimDir(db, rootElement, knownNotesDirRef);

    const droppedWorkspaceOrNot = await thusJsonDrop<NotesWorkspace>().willTryMake(notesDir, workspacePath);
    if (isNull(droppedWorkspaceOrNot)) return alert(`No workspace at: ${workspacePath}`);
    const droppedWorkspace = droppedWorkspaceOrNot;

    const workspace = droppedWorkspace.data;
    const workspaceDir = droppedWorkspace.dir;
    async function onChangedBox(key: NoteKey, box: Partial<Box>) {
        const found = workspace.notes.find(x => x.key === key);
        if (isUndefined(found)) return;
        found.box = { ...found.box, ...box };
        await droppedWorkspace.willSave(workspace);
    }
    const notes = workspace.notes.map(config => {
        const { path, key, box, title } = normalizeNoteConfig(config);
        const drop = new TextDrop(workspaceDir, path);
        const note: NoteProps = { noteKey: key, drop, box, title, onChangedBox };
        return note;
    });
    const glob: NotesGlob = { db };
    const props: NotesAppProps = { notes, glob };
    const NotesApp = thusNotesApp();
    ReactDOM.render(<NotesApp {...props} />, rootElement)
}

if (window.sandbox === 'starting-notes-app') {
    run();
}
