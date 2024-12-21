import React from 'react';
import ReactDOM from 'react-dom';
import { Regarding } from './reacting';
import { broke, ignore, isNull } from './shared/core';

export interface ContextMenuProps<Item, Concern> {
    x: number;
    y: number;
    hideMenu: () => void;
    items: Item[];
    regarding: Regarding<Concern>;
}

export function thusContextMenu<Item, Concern>(defaults: {
    render: (hideMenu: () => void, item: Item, regarding: Regarding<Concern>) => JSX.Element,
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
            const { items, regarding, hideMenu } = this.props;
            return <div ref={e => this.menuElement = e} className="context-menu">
                {items.map(item => render(hideMenu, item, regarding))}
            </div>;
        }
    }
}


if (window.sandbox === 'context-menu') {
    const rootElement = document.getElementById('root')!;
    const ContextMenu = thusContextMenu<string, string>({
        render: (hideMenu, item, regarding) => <a key={item} href="#"
            className="context-menu-item"
            onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                regarding(item);
                hideMenu();
            }}>{item}</a>
    });
    const items = ['test'];
    ReactDOM.render(<ContextMenu hideMenu={ignore} x={100} y={100} items={items} regarding={ignore} />, rootElement);
}

export type MenuItem<Concern> =
    | MultiActionableMenuItem<Concern>
    | ConcernMenuItem<Concern>
    | InfoMenuItem
    | LinkMenuItem
    | ActMenuItem;

export interface InfoMenuItem {
    kind: 'info-menu-item';
    key: string;
    text: string;
}
export interface ActMenuItem {
    kind: 'act-menu-item';
    key: string;
    text: string;
    act: Act;
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

export function renderMenuItem<Concern>(hideMenu: () => void, item: MenuItem<Concern>, regarding: Regarding<Concern>) {
    switch (item.kind) {
        case 'info-menu-item': {
            const { key, text } = item;
            return <span key={key} className="context-menu-item-for-info">{text}</span>;
        }
        case 'concern-menu-item': {
            const { key, text, concern } = item;
            return <a key={key} href="#"
                className="context-menu-item-for-concern" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    regarding(concern);
                    hideMenu();
                }}>{text}</a>;
        }
        case 'act-menu-item': {

            const { key, text, act } = item;
            return <a key={key} href="#"
                className="context-menu-item-for-act" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    act();
                    hideMenu();
                }}>{text}</a>;
        }
        case 'link-menu-item': {
            const { key, text, url } = item;
            return <a key={key} href={url} onClick={() => {
                hideMenu();
            }} target="_blank"
                className="context-menu-item-for-link">{text}</a>;
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
                        hideMenu();
                    }}>{text}</a>;
                })}
            </div>;
        }
        default: return broke(item);
    }
}
