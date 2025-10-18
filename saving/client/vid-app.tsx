import React, { MouseEventHandler } from 'react';
import { countAllThat } from '../shared/arrays';
import { isNull } from '../shared/core';
import { willTryMakePostRequest } from './ajaxing';
import { willTryGetDir } from './reading-writing-files';
import { thusVidItem, VidItemProps } from './vid-item';

export interface VidAppProps {
    vids: FileSystemFileHandle[];
    vidsDirPath: string;
    vidsDir: FileSystemDirectoryHandle;
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
            const url = 'http://127.0.0.1:8080/workflow';
            const body = {
                video_dirpath: this.props.vidsDirPath,
                video_filename: filename,
            };
            const tried = await willTryMakePostRequest(url, body);
            if (tried.kind !== 'got-response') return console.log('Bad try:', tried);
            let text = await tried.response.json() as string; // parsing first time
            text = text.replaceAll(': NaN', ': 0');
            const json = JSON.parse(text); // parsing second time
            console.log(json);
            const result = { seed: -1, template: 'No template.', size: 'No size', prompt: `No prompt` };
            for (const node of json.nodes) {
                if (node.title === 'Seed') {
                    result.seed = node.widgets_values[0];
                }
                if (node.type === 'PresetSizeNode') {
                    result.size = node.widgets_values[0];
                }
                if (node.title === 'Intestinals') {
                    result.template = node.widgets_values[0];
                }
            }
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


        private makeState(): State {
            const { vids } = this.props;
            const items = vids.map(file => ({
                file,
                isSelected: false,
                onToggled: this.whenTogglingItem,
                onRequestedPrompt: this.whenRequestedPrompt,
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
