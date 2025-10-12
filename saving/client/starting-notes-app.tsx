import React from 'react';
import ReactDOM from 'react-dom';
import { isNonNull } from '../shared/core';
import { Drop } from './drop';
import { knownNotesDirRef } from './file-system-entries';
import { willOpenKnownDb } from './known-database';
import { NoteProps } from './note';
import { NotesAppProps, thusNotesApp } from './notes-app';
import { NotesGlob } from './notes-glob';
import { toRandKey } from './reacting';
import { readStringFromQueryStringOr } from './reading-query-string';
import { willClaimDir } from './setting-up-notes-app';

async function run() {
    const db = await willOpenKnownDb();

    const title = readStringFromQueryStringOr(/[?&]title=([-_\w\d]+)/ig, null);
    if (isNonNull(title)) {
        document.title = title;
    }

    const rootElement = document.getElementById('root')!;
    const notesDir = await willClaimDir(db, rootElement, knownNotesDirRef);
    const glob: NotesGlob = { db, notesDir };
    const drop = new Drop(notesDir, 'test.txt');
    const key = toRandKey();
    const note: NoteProps = { key, drop };
    const notes = [note];
    const props: NotesAppProps = { notes, glob };
    const NotesApp = thusNotesApp();
    ReactDOM.render(<NotesApp {...props} />, rootElement)
}

if (window.sandbox === 'starting-notes-app') {
    run();
}
