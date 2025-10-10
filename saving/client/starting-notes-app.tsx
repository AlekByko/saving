import React from 'react';
import ReactDOM from 'react-dom';
import { isNonNull } from '../shared/core';
import { knownNotesDirRef } from './file-system-entries';
import { willOpenKnownDb } from './known-database';
import { NotesAppProps, thusNotesApp } from './notes-app';
import { NotesGlob } from './notes-glob';
import { readStringFromQueryStringOr } from './reading-query-string';
import { willClaimDir } from './setting-up-notes-app';

async function run() {
    const db = await willOpenKnownDb();
    // const maxCount = readNumberFromQueryString(/[?&]count=(\d+)/ig, 10);
    // const givenTags = readTagsInQueryString(window.location.search) ?? [];
    // const matesDir = await willTryGetDirFromDb(db, knownMatesDirRef);
    // sureNonNull(matesDir, 'pairs dir');

    const title = readStringFromQueryStringOr(/[?&]title=([-_\w\d]+)/ig, null);
    if (isNonNull(title)) {
        document.title = title;
    }



    const rootElement = document.getElementById('root')!;

    // const repository = new Repository();
    // const tracker = makeCamConfigTracker(repository);
    // const nameBuckets: GlobalNameBuckets = new Map();

    const notesDir = await willClaimDir(db, rootElement, knownNotesDirRef);

    const glob: NotesGlob = { db, notesDir };
    const props: NotesAppProps = { glob};
    const NotesApp = thusNotesApp();
    ReactDOM.render(<NotesApp {...props} />, rootElement)
}

if (window.sandbox === 'starting-notes-app') {
    run();
}
