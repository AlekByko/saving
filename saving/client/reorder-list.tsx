import * as React from 'react';
import { DragEventHandler } from 'react';
import ReactDOM from 'react-dom';
import { areStringsEqual, broke, compareRandom, isNonNull, isNull } from '../shared/core';
import { addClassIfDefined, ReactConstructor } from './reacting';


export interface ReorderListProps<Item> {
    items: Item[];
}

export function thusReorderList<ItemProps extends object>(
    defaults: {
        type: 'vertical' | 'horizontal',
        Item: ReactConstructor<ItemProps>,
        keyOf: (item: ItemProps) => string;
    }
) {

    type HoldingPlace = 'start' | 'end';

    interface Hovered { key: string; where: HoldingPlace; }

    interface State {
        items: ItemProps[];
        baselineItems: ItemProps[];
        draggedKey: string | null;
        hovered: Hovered | null;
    }

    function makeState(props: Props): State {
        const { items } = props;
        return { items, baselineItems: items, draggedKey: null, hovered: null };
    }

    type Props = ReorderListProps<ItemProps>;

    return class ReorderList extends React.Component<Props, State> {

        static Props: Props;

        state = makeState(this.props);
        listElement: HTMLDivElement | null = null;

        static getDerivedStateFromProps(props: Props, state: State): State | null {
            const { items } = props;
            if (items !== state.baselineItems) {
                return { ...state, baselineItems: items, items } satisfies State;
            }
            return null;
        }

        whenDragLeave: DragEventHandler<HTMLDivElement> = e => {
            e.stopPropagation();
            const { listElement } = this;
            if (isNull(listElement)) return this.setState({ hovered: null });
            const isStillInside = seeIfStillInside(listElement, e);
            if (!isStillInside) {
                this.setState({ hovered: null });
            }
        };

        whenDrop: DragEventHandler<HTMLDivElement> = _e => {
            _e.stopPropagation();
            const { draggedKey, hovered, items } = this.state;
            if (isNull(draggedKey)) return;
            if (isNull(hovered)) return;
            const draggedAt = items.findIndex(item => areStringsEqual(defaults.keyOf(item), draggedKey));
            if (draggedAt < 0) return;
            let holdingAt = items.findIndex(x => areStringsEqual(defaults.keyOf(x), hovered.key));
            if (holdingAt < 0) return;
            switch (hovered.where) {
                case 'start': break;
                case 'end': holdingAt += 1; break;
                default: return broke(hovered.where);
            }
            const dragged = items[draggedAt];
            items.splice(draggedAt, 1);
            items.splice(holdingAt > draggedAt ? holdingAt - 1 : holdingAt, 0, dragged);
        };

        whenDragOver: DragEventHandler<HTMLDivElement> = e => {
            e.preventDefault();
            e.stopPropagation();
            const key = e.currentTarget.getAttribute('data-key');
            if (isNull(key)) return;
            let where: HoldingPlace;
            switch (defaults.type) {
                case 'vertical': {
                    const { clientY } = e;
                    const { top, height } = e.currentTarget.getBoundingClientRect();
                    const midY = top + height / 2;
                    if (clientY > midY) {
                        where = 'end';
                    } else {
                        where = 'start';
                    }
                    break;
                }
                case 'horizontal': {
                    const { clientX } = e;
                    const { left, width } = e.currentTarget.getBoundingClientRect();
                    const midX = left + width / 2;
                    if (clientX > midX) {
                        where = 'end';
                    } else {
                        where = 'start';
                    }
                    break;
                }
                default: return broke(defaults.type);
            }

            this.setState({ hovered: { key, where } });
        };

        whenDragEnd: DragEventHandler<HTMLDivElement> = _e => {
            _e.stopPropagation();
            this.setState({ draggedKey: null, hovered: null });
        };

        whenDragStart: DragEventHandler<HTMLDivElement> = e => {
            const key = e.currentTarget.getAttribute('data-key');
            if (isNull(key)) return;
            e.stopPropagation();
            this.setState({ draggedKey: key });
        };

        render() {
            const { items, draggedKey, hovered } = this.state;
            const listClass = 'reorder-list ' + seeWhatOrientationClassIs();
            return <div className={listClass} ref={e => this.listElement = e}>
                {items.map(item => {
                    const key = defaults.keyOf(item);
                    const draggedClass = draggedKey === key ? 'as-dragged' : undefined;
                    const hoveredClass = seeWhatHoveredClassIs(hovered, key, draggedKey);
                    const itemClass = 'reorder-list-item' + addClassIfDefined(draggedClass) + addClassIfDefined(hoveredClass);
                    return <div
                        key={key}
                        className={itemClass}
                        draggable
                        data-key={key}
                        onDragStart={this.whenDragStart}
                        onDragEnd={this.whenDragEnd}
                        onDragOver={this.whenDragOver}
                        onDrop={this.whenDrop}
                        onDragLeave={this.whenDragLeave}
                    ><div className="reorder-list-item-drag-handle" /><defaults.Item {...item} /></div>;
                })}
            </div>;
        }
    };

    function seeWhatHoveredClassIs(hovered: Hovered | null, key: string, draggedKey: string | null) {
        if (isNull(hovered)) return undefined;
        if (hovered.key !== key) return undefined;
        if (hovered.key === draggedKey) return undefined;
        const { where } = hovered;
        switch (defaults.type) {
            case 'vertical': {
                switch (where) {
                    case 'start': return 'as-holding-place-at-top';
                    case 'end': return 'as-holding-place-at-bottom';
                    default: return broke(where);
                }
            }
            case 'horizontal': {
                switch (where) {
                    case 'start': return 'as-holding-place-at-left';
                    case 'end': return 'as-holding-place-at-right';
                    default: return broke(where);
                }
            }
            default: return broke(defaults.type);
        }
    }

    function seeWhatOrientationClassIs() {
        switch (defaults.type) {
            case 'vertical': return 'as-vertical';
            case 'horizontal': return 'as-horizontal';
            default: return broke(defaults.type);
        }
    }

    function seeIfChild(parent: HTMLElement, child: HTMLElement) {
        for (let el = child.parentElement; isNonNull(el); el = el.parentElement) {
            if (el === parent) return true;
        }
        return false;
    }

    function seeIfStillInside(listElement: HTMLElement, e: React.DragEvent<HTMLDivElement>): boolean {
        return seeIfChild(listElement, e.currentTarget);
    }
}

if (window.sandbox === 'reorder-list') {

    interface ItemProps {
        key: string;
        name: string;
    }
    class Item extends React.Component<ItemProps> {
        render() {
            const { name } = this.props;
            return <div>{name}</div>
        }
    }

    const HorizontalList = thusReorderList({
        type: 'horizontal',
        Item: Item,
        keyOf: (x: ItemProps) => x.key,
    });
    const VericalList = thusReorderList({
        type: 'vertical',
        Item: HorizontalList,
        keyOf: (x: ReorderListProps<ItemProps>) => x.items.map(x => x.name).join('/'),
    });
    interface AppState { items: ItemProps[] }
    class App extends React.Component<AppState, AppState> {

        state = this.props;
        whenOutsideEffect: React.MouseEventHandler<HTMLButtonElement> = () => {
            this.setState(state => {
                let { items } = state;
                items = [...items].sort(compareRandom);
                return { ...state, items } satisfies AppState;
            });
        };
        render() {
            const { items } = this.state;
            const props: typeof VericalList.Props = { items: [{ items }, { items: items.slice().reverse() }] };
            return <div>
                <div><VericalList {...props} /></div>
                <div><button onClick={this.whenOutsideEffect}>Outside effect</button></div>
            </div>;
        }
    }


    const rootElement = document.getElementById('root')!
    const items: ItemProps[] = [
        { key: 'A', name: 'Alpha' },
        { key: 'B', name: 'Beta' },
        { key: 'C', name: 'Gamma' },
        { key: 'D', name: 'Delta' },
    ];
    ReactDOM.render(<App items={items} />, rootElement);
    rootElement.style.padding = '10px';
}
