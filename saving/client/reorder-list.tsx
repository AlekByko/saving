import * as React from 'react';
import ReactDOM from 'react-dom';
import { broke, isNull } from '../shared/core';
import { addClassIfDefined } from './reacting';

export function thusReorderList() {

    interface State {
        items: string[];
        draggedKey: string | null;
        hover: { key: string; where: 'top' | 'bottom' } | null;
    }

    function makeState(): State {
        return { items: ['a', 'b', 'c'], draggedKey: null, hover: null };
    }

    return class ReorderList extends React.Component<{}, State> {
        state = makeState();
        render() {
            const { items, draggedKey, hover } = this.state;
            return <div className="reorder-list">
                {items.map(key => {
                    const isDragged = draggedKey === key;
                    const className = isNull(hover)
                        ? undefined
                        : hover.key !== key || hover.key === draggedKey
                            ? undefined
                            : 'as-holding-place-' + hover.where;
                    return <div
                        key={key}
                        className={"reorder-list-item" + addClassIfDefined(className)}
                        draggable
                        data-key={key}
                        onDragStart={_e => {
                            this.setState({ draggedKey: key });
                        }}
                        onDragEnd={_e => {
                            this.setState({ draggedKey: null, hover: null });
                        }}
                        onDragOver={e => {
                            e.preventDefault();
                            const { clientY } = e;
                            const { top, height } = e.currentTarget.getBoundingClientRect();
                            const midY = top + height / 2;
                            let where;
                            if (clientY > midY) {
                                where = 'bottom' as const;
                            } else {
                                where = 'top' as const;
                            }
                            this.setState({ hover: { key, where } });
                        }}
                        onDrop={_e => {
                            if (isNull(draggedKey)) return;
                            if (isNull(hover)) return;
                            const removeAt = items.findIndex(x => x === draggedKey);
                            if (removeAt < 0) return;
                            let insertAt = items.findIndex(x => x === hover.key);
                            if (insertAt < 0) return;
                            switch(hover.where) {
                                case 'top': break;
                                case 'bottom': insertAt += 1; break;
                                default: return broke(hover.where);
                            }
                            items.splice(removeAt, 1);
                            items.splice(insertAt > removeAt ? insertAt - 1 : insertAt, 0, draggedKey);
                        }}

                        style={{
                            opacity: isDragged ? 0 : 1,
                        }}
                    ><div className="reorder-list-item-drag-handle"></div> {key}</div>;
                })}
            </div>;
        }
    };
}

if (window.sandbox === 'reorder-list') {
    const ReorderList = thusReorderList();

    class App extends React.Component<{}, {}> {
        render() {
            return <ReorderList />;
        }
    }
    const rootElement = document.getElementById('root')!
    ReactDOM.render(<App />, rootElement);
    rootElement.style.padding = '10px';
}
