import React from 'react';
import ReactDOM from 'react-dom';
import { isNonNull, isNull, isUndefined, keysOf } from '../shared/core';
import { thusAiApp } from './ai-app';
import { ACuiWorkflow } from './comfyui-info';
import { knownConfigsDirRef } from './file-system-entries';
import { willOpenKnownDb } from './known-database';
import { willReadJsonFromFileHandle } from './reading-from-file-handles';
import { readPathFromQueryStringOr, readStringFromQueryStringOr } from './reading-query-string';
import { willGetFileHandleOr, willTryGetDirDeepFastNoChecks, willTryLoadDirRef } from './reading-writing-files';

if (window.sandbox === 'starting-ai-app') {


    const title = readStringFromQueryStringOr(/[?&]title=([-_\w\d]+)/ig, null);
    if (isNonNull(title)) {
        document.title = title;
    }



    function makeRandom() {
        const a = Math.random() * 0x200000; // upper 21 bits
        const b = Math.random() * 0x100000000; // lower 32 bits
        return ((a | 0) * 0x100000000) + (b >>> 0);
    }

    const App = thusAiApp();
    const rootElement = document.getElementById('root')!;

    async function run() {
        const templatePath = readPathFromQueryStringOr('templatePath', null);
        if (isNull(templatePath)) return alert(`No templatePath.`);

        const db = await willOpenKnownDb();
        const configsDir = await willTryLoadDirRef(db, knownConfigsDirRef);
        if (isNull(configsDir)) return alert(`No config dir.`);


        const [templateName, ...templateSubDirnames] = templatePath.split(/[\\/]/g).map(x => x.trim()).filter(x => x).reverse();
        templateSubDirnames.reverse();
        const templateDir = await willTryGetDirDeepFastNoChecks(configsDir, templateSubDirnames);
        if (isNull(templateDir)) return alert(`No dir at: ${templateSubDirnames.join('/')}`);
        const templateHandle = await willGetFileHandleOr(templateDir, templateName, null);
        if (isNull(templateHandle)) return alert(`No file at: ${templateSubDirnames.join('/')} ${templateName}`);
        const workflow: ACuiWorkflow = await willReadJsonFromFileHandle(templateHandle);
        console.log(workflow);
        // if (2 > 1) return;
        const props: typeof App.Props = {
            text: window.name,
            onTested: async text => {
                console.log(text);
                window.name = text;

                const keys = keysOf(workflow);
                const foundKey = keys.find(key => workflow[key]._meta.title === 'Positive Prompt');
                if (isUndefined(foundKey)) return alert(`No positive prompt node.`);
                const nodePrompt = workflow[foundKey];
                if (nodePrompt.class_type !== 'CLIPTextEncode') return alert(`Bad prompt node: ${nodePrompt.class_type}`);
                nodePrompt.inputs.text = text;

                const payload = {
                    prompt: workflow,
                    client_id: makeRandom(),
                };
                const body = JSON.stringify(payload);
                const res = await fetch(`http://127.0.0.1:8000/prompt`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body,
                });

                const data = await res.json();
                console.log("Response:", data);
            },
        }

        ReactDOM.render(<App {...props} />, rootElement);
    }
    run();
}
