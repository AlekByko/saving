import React from 'react';
import ReactDOM from 'react-dom';
import { compareStrings, isNull } from '../shared/core';
import { knownVidsDirRef } from './file-system-entries';
import { willOpenKnownDb } from './known-database';
import { readNumberFromQueryString, readStringFromQueryStringOr } from './reading-query-string';
import { willReadAllFileHandles } from './reading-writing-files';
import { willClaimDir } from './setting-up-notes-app';
import { thusVidApp, VidAppProps } from './vid-app';
if (window.sandbox === 'starting-vids-app') {

    const skip = readNumberFromQueryString(/[?&]skip=(\d+)/, 0);
    const count = readNumberFromQueryString(/[?&]count=(\d+)/, 0);
    const vidsDirPath = readStringFromQueryStringOr(/[?&]vidsDir=([-/\\:_\w\d]+)/, null);
    const promptNodeId = readNumberFromQueryString(/[?&]promptNode=([\d]+)/, null);
    const seedNodeId = readNumberFromQueryString(/[?&]seedNode=([\d]+)/, null);
    function onSkipping(delta: number): void {
        let url = window.location.href;
        url = url.replaceAll(/skip=\d+/g, `skip=${skip + delta}`)
        window.location.href = url;
    }
    async function run() {
        if (isNull(vidsDirPath)) return alert(`No vidsDir.`);
        if (isNull(promptNodeId)) return alert(`No promptNode.`);
        if (isNull(seedNodeId)) return alert(`No seedNode.`);

        const db = await willOpenKnownDb();
        const rootElement = document.getElementById('root')!;


        const vidsDir = await willClaimDir(db, rootElement, knownVidsDirRef);
        const allVids = (await willReadAllFileHandles(vidsDir))
            .filter(x => x.name.endsWith('.mp4'))
            .sort((a, b) => compareStrings(a.name, b.name));


        const App = thusVidApp();
        const props: VidAppProps = {
            vidsDirPath, allVids, vidsDir, seedNodeId, promptNodeId, onSkipping, skip, count,
        };
        ReactDOM.render(<App {...props} />, rootElement);
    }
    run();
}
