import React from 'react';
import ReactDOM from 'react-dom';
import { isNonNull } from '../shared/core';
import { NotesAppProps, thusNotesApp } from './notes-app';
import { readStringFromQueryStringOr } from './reading-query-string';

async function run() {
    // const db = await willOpenKnownDb();
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
    // const glob: NotesGlob = { };
    const props: NotesAppProps = {
    };
    const NotesApp = thusNotesApp();
    ReactDOM.render(<NotesApp {...props} />, rootElement)
}

if (window.sandbox === 'starting-notes-app') {
    run();
}
