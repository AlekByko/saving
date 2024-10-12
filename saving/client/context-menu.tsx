import React from 'react';
import ReactDOM from 'react-dom';
import { Regarding } from './reacting';
import { ignore } from './shared/core';

export interface ContextMenuProps<Item, Concern> {
    items: Item[];
    regarding: Regarding<Concern>;
}

export function thusContextMenu<Item, Concern>(defaults: {
    render: (item: Item, regarding: Regarding<Concern>) => JSX.Element,
}) {
    const { render } = defaults;
    type Props = ContextMenuProps<Item, Concern>;
    return class ContextMenu extends React.Component<Props> {
        static Props: Props;
        render() {
            const { items, regarding } = this.props;
            return <div className="context-menu">
                {items.map(item => render(item, regarding))}
            </div>;
        }
    }
}


if (window.sandbox === 'context-menu') {
    const rootElement = document.getElementById('root')!;
    const ContextMenu = thusContextMenu<string, string>({
        render: (item, regarding) => <a key={item} href="#"
            className="context-menu-item"
            onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                regarding(item);
            }}>{item}</a>
    });
    const items = ['test'];
    ReactDOM.render(<ContextMenu items={items} regarding={ignore} />, rootElement);
}
