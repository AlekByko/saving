import React from 'react';
import ReactDOM from 'react-dom';
import { isNull } from '../shared/core';
import { knownNotesDirRef } from './file-system-entries';
import { thusJsonDrop } from './json-drop';
import { willOpenKnownDb } from './known-database';
import { NotesAppProps, thusNotesApp } from './notes-app';
import { NotesGlob } from './notes-glob';
import { defaultizeNotesWorkspace, NotesWorkspace } from './notes-workspace';
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

    const droppedWorkspaceOrNot = await thusJsonDrop<Partial<NotesWorkspace>>({
        makeDefault: () => {
            return { notes: [], x: 0, y: 0 } satisfies NotesWorkspace;
        }
    }).willTryMake(notesDir, workspacePath);
    if (isNull(droppedWorkspaceOrNot)) return alert(`No workspace at: ${workspacePath}`);
    const droppedWorkspace = droppedWorkspaceOrNot;

    const workspace = droppedWorkspace.data;
    defaultizeNotesWorkspace(workspace);

    const workspaceDir = droppedWorkspace.dir;
    async function onChangedWorkspace() {
        droppedWorkspace.willSave(workspace);
    }

    const glob: NotesGlob = { db };
    const props: NotesAppProps = { workspace, workspaceDir, glob, onChangedWorkspace };
    const NotesApp = thusNotesApp();
    ReactDOM.render(<NotesApp {...props} />, rootElement)
}

if (window.sandbox === 'starting-notes-app') {
    run();
}
