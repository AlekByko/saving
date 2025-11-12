import React from 'react';
import ReactDOM from 'react-dom';
import { isNonNull, isNull } from '../shared/core';
import { knownNotesDirRef } from './file-system-entries';
import { thusJsonDrop } from './json-drop';
import { willOpenKnownDb } from './known-database';
import { NoteProps } from './note';
import { NotesAppProps, thusNotesApp } from './notes-app';
import { NotesGlob } from './notes-glob';
import { defaultsSetNoteConfig, NotesWorkspace } from './notes-workspace';
import { readPathFromQueryStringOr, readStringFromQueryStringOr } from './reading-query-string';
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
    const droppedWorkspace = await thusJsonDrop<NotesWorkspace>().willTryMake(notesDir, workspacePath);
    if (isNull(droppedWorkspace)) return alert(`No workspace at: ${workspacePath}`);
    const workspace = droppedWorkspace.data;
    const workspaceDir = droppedWorkspace.dir;
    const notes = workspace.notes.map(config => {
        const { path, key, x, y, title } = defaultsSetNoteConfig(config);
        const drop = new TextDrop(workspaceDir, path);
        const note: NoteProps = { key, drop, x, y, title };
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
