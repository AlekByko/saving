import React from 'react';
import ReactDOM from 'react-dom';
import { isNonNull, isNull, isUndefined } from '../shared/core';
import { thusAiApp } from './ai-app';
import { CuiWorkflow, findNodesThat } from './comfyui-info';
import { makeSeed } from './ed-backend';
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





    const App = thusAiApp();
    const rootElement = document.getElementById('root')!;

    async function run() {


        const templatePath = readPathFromQueryStringOr('templatePath', null);
        if (isNull(templatePath)) return alert(`No templatePath.`);

        const db = await willOpenKnownDb();
        const configsDir = await willTryLoadDirRef(db, knownConfigsDirRef);
        if (isNull(configsDir)) return alert(`No config dir.`);


        const workflow = await willLoadWorkflow(configsDir, templatePath);
        if (isNull(workflow)) return alert(`No workflow.`);
        console.log(workflow);


        const props: typeof App.Props = {
            text: window.name,
            onScheduling: async params => {
                const { prompt, height, template, width, seed } = params;
                console.log(params);
                window.name = template;

                const textNodes = findNodesThat(workflow, x => x.class_type === 'CLIPTextEncode');

                const promptNode = textNodes.find(x => x._meta.title === 'Positive Prompt');
                if (isUndefined(promptNode)) return alert(`No positive prompt node.`);
                promptNode.inputs.text = prompt;

                const templateNode = textNodes.find(x => x._meta.title === 'Template');
                if (isUndefined(templateNode)) return alert(`No template node.`);
                templateNode.inputs.text = template;

                const samplers = findNodesThat(workflow, x => x.class_type === 'KSamplerAdvanced');
                samplers.forEach(x => {
                    x.inputs.noise_seed = seed;
                });

                const latent = findNodesThat(workflow, x => x.class_type === 'EmptyHunyuanLatentVideo');
                latent.forEach(x => {
                    x.inputs.height = height;
                    x.inputs.width = width;
                });

                const ticketId = makeSeed();
                const payload = {
                    prompt: workflow,
                    client_id: ticketId,
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

async function willLoadWorkflow(
    configsDir: FileSystemDirectoryHandle,
    templatePath: string
) {
    const [templateName, ...templateSubDirnames] = templatePath.split(/[\\/]/g).map(x => x.trim()).filter(x => x).reverse();
    templateSubDirnames.reverse();
    const templateDir = await willTryGetDirDeepFastNoChecks(configsDir, templateSubDirnames);
    if (isNull(templateDir)) return (alert(`No dir at: ${templateSubDirnames.join('/')}`), null);
    const templateHandle = await willGetFileHandleOr(templateDir, templateName, null);
    if (isNull(templateHandle)) return (alert(`No file at: ${templateSubDirnames.join('/')} ${templateName}`), null);
    const workflow: CuiWorkflow = await willReadJsonFromFileHandle(templateHandle);
    return workflow;
}
