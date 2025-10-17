import React, { MouseEventHandler } from 'react';
import { countAllThat } from '../shared/arrays';
import { thusVidItem, VidItemProps } from './vid-item';

export interface VidAppProps {
    vids: FileSystemFileHandle[];
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

        state = this.makeState();

        whenDeletigVids: MouseEventHandler<HTMLButtonElement> = async _e => {
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

        private makeState(): State {
            const { vids } = this.props;
            const items = vids.slice(0, 10).map(file => ({ file, isSelected: false, onToggled: this.whenTogglingItem } satisfies VidItemProps));
            return { items };
        }

        render() {
            const { items } = this.state;
            const selectedCount = countAllThat(items, x => x.isSelected);
            return <div>
                <div className="vid-toolbar">
                    <button onClick={this.whenDeletigVids} disabled={selectedCount < 1}>{selectedCount > 0 ? `Deleted (${selectedCount})` : 'Delete'}</button>
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
