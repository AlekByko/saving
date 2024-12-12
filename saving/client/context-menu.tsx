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

export type MenuItem<Concern> =
    | MultiActionableMenuItem<Concern>
    | ConcernMenuItem<Concern>
    | InfoMenuItem
    | LinkMenuItem;

export interface InfoMenuItem {
    kind: 'info-menu-item';
    key: string;
    text: string;
}

export interface MultiActionableMenuItem<Concern> {
    kind: 'multi-actionable-menu-item';
    key: string;
    options: {
        text: string;
        concern: Concern;
    }[];
}

export interface ConcernMenuItem<Concern> {
    kind: 'concern-menu-item';
    key: string;
    text: string;
    concern: Concern;
}

export interface LinkMenuItem {
    kind: 'link-menu-item';
    key: string;
    text: string;
    url: string;
}

export function renderMenuItem<Concern>(item: MenuItem<Concern>, regarding: Regarding<Concern>) {
    switch (item.kind) {
        case 'info-menu-item': {
            const { key, text } = item;
            return <span key={key} className="info-context-menu-item">{text}</span>;
        }
        case 'concern-menu-item': {
            const { key, text, concern } = item;
            return <a key={key} href="#"
                className="actionable-context-menu-item" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    regarding(concern);
                }}>{text}</a>;
        }
        case 'link-menu-item': {
            const { key, text, url } = item;
            return <a key={key} href={url} target="_blank"
                className="actionable-context-menu-item">{text}</a>;
        }
        case 'multi-actionable-menu-item': {
            const { key, options } = item;
            return <div key={key} className="multi-actionable-context-menu-item">
                {options.map(option => {
                    const { text, concern } = option;
                    return <a key={text} href="#" className="multi-actionable-context-menu-item-option" onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        regarding(concern);
                    }}>{text}</a>;
                })}
            </div>;
        }
        default: return broke(item);
    }
}
