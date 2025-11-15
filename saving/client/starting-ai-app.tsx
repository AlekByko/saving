import React from 'react';
import ReactDOM from 'react-dom';
import { fail, isNonNull, isNull, isUndefined } from '../shared/core';
import { thusAiApp } from './ai-app';
import { AiWorkspace } from './ai-workspace';
import { CuiWorkflow, findNodesThat } from './comfyui-info';
import { knownConfigsDirRef } from './file-system-entries';
import { thusJsonDrop } from './json-drop';
import { willOpenKnownDb } from './known-database';
import { makeSeed } from './randomizing';
import { readPathFromQueryStringOr, readStringFromQueryStringOr } from './reading-query-string';
import { willTryLoadDirRef } from './reading-writing-files';

if (window.sandbox === 'starting-ai-app') {

    function dump(...things: any[] & { 0: string }) {
        const [title, ...rest] = things;
        console.groupCollapsed(title);
        for (const thing of rest) {
            console.log(thing);
        }
        console.groupEnd();
    }


    const title = readStringFromQueryStringOr(/[?&]title=([-_\w\d]+)/ig, null);
    if (isNonNull(title)) {
        document.title = title;
    }


    const App = thusAiApp();
    const rootElement = document.getElementById('root')!;

    async function run() {



        const db = await willOpenKnownDb();
        const configsDir = await willTryLoadDirRef(db, knownConfigsDirRef);
        if (isNull(configsDir)) return alert(`No config dir.`);

        const workspacePath = readPathFromQueryStringOr('workspace', null);
        if (isNull(workspacePath)) return alert(`No workspace.`);
        console.log({ workspacePath });

        const droppedWorkspace = await thusJsonDrop<AiWorkspace>({
            makeDefault: () => {
                const workflowPath = prompt('Workflow path:');
                if (isNull(workflowPath)) {
                    alert(`No workflow path.`);
                    return fail(`No workflow path.`);
                }
                return { template: 'Make image.', workflowPath };
            }
        }).willTryMake(configsDir, workspacePath);
        if (isNull(droppedWorkspace)) return alert(`No workspace drop.`);
        const workspace = droppedWorkspace.data;
        const { workflowPath } = workspace;

        const droppedWorkflow = await thusJsonDrop<CuiWorkflow>({
        }).willTryMake(configsDir, workflowPath);
        if (isNull(droppedWorkflow)) return alert(`No workflow drop.`);
        const workflow = droppedWorkflow.data;

        dump('workflow', workflow);

        let scheduledSave = 0;

        const props: typeof App.Props = {
            text: workspace.template,
            onSaveTemplate: text => {
                window.clearTimeout(scheduledSave);
                scheduledSave = window.setTimeout(async () => {
                    workspace.template = text;
                    await droppedWorkspace.willSave(workspace);
                }, 500);
            },
            onScheduling: async params => {
                const { prompt, height, template, width, seed } = params;
                console.log(params);

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


