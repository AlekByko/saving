import React, { MouseEventHandler } from 'react';
import { countAllThat } from '../shared/arrays';
import { isNull, isUndefined } from '../shared/core';
import { willTryMakePostRequest } from './ajaxing';
import { willTryGetDir } from './reading-writing-files';
import { thusVidItem, VidItemProps, VidPromptSettings } from './vid-item';

export interface VidAppProps {
    vids: FileSystemFileHandle[];
    vidsDirPath: string;
    vidsDir: FileSystemDirectoryHandle;
    seedNodeId: number;
    promptNodeId: number;
    onSkipping: (delta: number) => void;
}
export function thusVidApp() {

    interface State {
        items: VidItemProps[];
    }

    const Item = thusVidItem();

    return class App extends React.Component<VidAppProps, State> {

        whenTogglingItem = (filename: string) => {

            this.setState(state => {
                let { items } = state;
                items = items.map(item => {
                    if (item.file.name === filename) return { ...item, isSelected: !item.isSelected } satisfies VidItemProps;
                    return item;
                });
                return { ...state, items } satisfies State;
            });
        };

        whenRequestedPrompt = async (filename: string) => {

            const triedWorkflow = await willTryMakePostRequest('http://127.0.0.1:8080/workflow', {
                video_dirpath: this.props.vidsDirPath,
                video_filename: filename,
            });
            if (triedWorkflow.kind !== 'got-response') {
                console.log('Bad workflow attempt:', triedWorkflow);
                return null;
            }
            let text = await triedWorkflow.response.json() as string; // parsing first time
            text = text.replaceAll(': NaN', ': 0');
            const json = JSON.parse(text); // parsing second time
            console.log(json);
            const result: VidPromptSettings = { seed: -1, template: 'No template.', prompt: `No prompt` };
            const { promptNodeId, seedNodeId } = this.props;
            for (const node of json.nodes) {
                if (node.id === seedNodeId) {
                    result.seed = node.widgets_values[0];
                }
                // if (node.type === 'PresetSizeNode') {
                //     result.size = node.widgets_values[0];
                // }
                if (node.id === promptNodeId) {
                    result.template = node.widgets_values[0];
                }
            }

            const triedPrompt = await willTryMakePostRequest('http://127.0.0.1:8080/prompt', {
                template: result.template,
                seed: result.seed,
            });
            if (triedPrompt.kind !== 'got-response') {
                console.log('Bad prompt attempt:', triedPrompt);
                return null;
            }
            text = await triedPrompt.response.json() as string; // parsing first time
            // console.log(text);
            result.prompt = text;
            return result;
        }



        whenSelectingAll: MouseEventHandler<HTMLButtonElement> = async _e => {
            this.setState(state => {
                let { items } = state;
                items = items.map(x => ({ ...x, isSelected: true } satisfies VidItemProps));
                return { ...state, items } satisfies State;
            });
        }
        whenDeletingSelected: MouseEventHandler<HTMLButtonElement> = async _e => {
            if (!confirm('Are you sure?')) return;
            const removedNames = new Set<string>();
            for (const item of this.state.items) {
                if (!item.isSelected) continue;
                await item.file.remove();
                removedNames.add(item.file.name);
            }
            this.setState(state => {
                let { items } = state;
                items = items.filter(x => !removedNames.has(x.file.name));
                return { ...state, items } satisfies State;
            });
        };
        whenMovingSelected: MouseEventHandler<HTMLButtonElement> = async _e => {
            if (!confirm('Are you sure?')) return;
            const where = prompt('Where?');
            const { vidsDir } = this.props;
            if (isNull(where)) return;
            const whereDir = await willTryGetDir(vidsDir, where);
            if (isNull(whereDir)) return alert(`No ${where} dir.`);
            const movedNames = new Set<string>();
            for (const item of this.state.items) {
                if (!item.isSelected) continue;
                await item.file.move(whereDir);
                movedNames.add(item.file.name);
            }
            this.setState(state => {
                let { items } = state;
                items = items.filter(x => !movedNames.has(x.file.name));
                return { ...state, items } satisfies State;
            });
        };
        whenDeleting = async (filename: string) => {
            const found = this.state.items.find(x => x.file.name === filename);
            if (isUndefined(found)) return;
            await found.file.remove();
            this.setState(state => {
                let { items } = state;
                items = items.filter(x => found !== x);
                return { ...state, items } satisfies State;
            });
        };
        whenSkippingPlus10: MouseEventHandler<HTMLAnchorElement> = e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onSkipping(10);
        };
        whenSkippingPlus05: MouseEventHandler<HTMLAnchorElement> = e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onSkipping(5);
        };

        private makeState(): State {
            const { vids } = this.props;
            const items = vids.map(file => ({
                file,
                isSelected: false,
                onToggled: this.whenTogglingItem,
                onRequestedPromptSettings: this.whenRequestedPrompt,
                onDeleting: this.whenDeleting
            } satisfies VidItemProps));
            return { items };
        }

        state = this.makeState();

        render() {
            const { items } = this.state;
            const selectedCount = countAllThat(items, x => x.isSelected);
            const canSelectAll = selectedCount < items.length;
            const canDelete = selectedCount > 0;
            const canMove = selectedCount > 0;
            return <div>
                <div className="vid-toolbar">
                    <button onClick={this.whenSelectingAll} disabled={!canSelectAll}>{canSelectAll ? `Select All` : `Selected`}</button>
                    <button onClick={this.whenDeletingSelected} disabled={!canDelete}>{canDelete ? `Delete (${selectedCount})` : 'Delete'}</button>
                    <button onClick={this.whenMovingSelected} disabled={!canMove}>{canMove ? `Move (${selectedCount})` : 'Move'}</button>
                    <a href="#" onClick={this.whenSkippingPlus10}>+10</a>
                    <a href="#" onClick={this.whenSkippingPlus05}>+5</a>
                </div>
                <div className="vid-list">
                    {items.map(item => {
                        return <Item key={item.file.name} {...item} />;
                    })}
                </div>
            </div>;
        }
    };
}
