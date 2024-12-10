import React from 'react';
import ReactDOM from 'react-dom';
import { Regarding } from './reacting';
import { broke, ignore, isNull } from './shared/core';

export interface ContextMenuProps<Item, Concern> {
    x: number;
    y: number;
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
        menuElement: HTMLDivElement | null = null;
        componentDidMount(): void {
            this.setPosition();
        }
        componentDidUpdate(): void {
            this.setPosition();
        }
        setPosition() {
            const { menuElement } = this;
            if (isNull(menuElement)) return;
            const { x, y } = this.props;
            menuElement.style.left = x + 'px';
            menuElement.style.top = y + 'px';
        }
        render() {
            const { items, regarding } = this.props;
            return <div ref={e => this.menuElement = e} className="context-menu">
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
    ReactDOM.render(<ContextMenu x={100} y={100} items={items} regarding={ignore} />, rootElement);
}

export type MenuItem<Concern> = ActionableMenuItem<Concern> | InfoMenuItem;

export interface InfoMenuItem {
    kind: 'info-menu-item';
    key: string;
    text: string;
}

export interface ActionableMenuItem<Concern> {
    kind: 'actionable-menu-item';
    key: string;
    text: string;
    concern: Concern;
}

export function renderMenuItem<Concern>(item: MenuItem<Concern>, regarding: Regarding<Concern>) {
    switch (item.kind) {
        case 'actionable-menu-item': {
            const { key, text, concern } = item;
            return <a key={key} href="#"
                className="context-menu-item as-actionable" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    regarding(concern);
                } }>{text}</a>;
        }
        case 'info-menu-item': {
            const { key, text } = item;
            return <span key={key} className="context-menu-item">{text}</span>;
        }
        default: return broke(item);
    }
}
