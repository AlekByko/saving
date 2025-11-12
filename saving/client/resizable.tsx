import React from 'react';
import { isNull } from '../shared/core';
import { addClassIfDefined } from './reacting';

export function enableMoving<Pos>(
    handleElement: HTMLElement,
    contentElement: HTMLElement,
    defaults: {
        readPos: (element: HTMLElement) => Pos;
        applyDelta: (element: HTMLElement, pos: Pos, dx: number, dy: number) => void;
    },
) {
    let startX = 0;
    let startY = 0;
    let startPos = defaults.readPos(contentElement);

    function whenMouseup(e: MouseEvent) {
        document.removeEventListener('mouseup', whenMouseup);
        document.removeEventListener('mousemove', whenMousemove);
        const dx = e.pageX - startX;
        const dy = e.pageY - startY;
        defaults.applyDelta(contentElement, startPos, dx, dy);
    }

    function whenMousemove(e: MouseEvent) {
        const dx = e.pageX - startX;
        const dy = e.pageY - startY;
        defaults.applyDelta(contentElement, startPos, dx, dy);
    }
    function whenMousedown(e: MouseEvent) {
        document.addEventListener('mousemove', whenMousemove);
        document.addEventListener('mouseup', whenMouseup);
        startX = e.pageX;
        startY = e.pageY;
        startPos = defaults.readPos(contentElement);
    }
    handleElement.addEventListener('mousedown', whenMousedown);
    return function dispose() {
        handleElement.removeEventListener('mousedown', whenMousedown);
    };
}
export interface ResizableProps {
    className?: string;
    refin: (element: HTMLElement | null) => void;
}
export class Resizable extends React.Component<ResizableProps> {

    private contentElement: HTMLElement | null = null;
    private bottomElement: HTMLDivElement | null = null;
    private topElement: HTMLDivElement | null = null;
    private leftElement: HTMLDivElement | null = null;
    private rightElement: HTMLDivElement | null = null;

    dispose = [] as Act[];
    componentDidMount(): void {
        const { contentElement, topElement, rightElement, bottomElement, leftElement } = this;
        if (isNull(contentElement) || isNull(topElement) || isNull(rightElement) || isNull(bottomElement) || isNull(leftElement)) return;
        this.dispose.push(...[
            enableMoving(topElement, contentElement, {
                readPos: element => {
                    const { top, height } = element.getBoundingClientRect();
                    return { top, height };
                },
                applyDelta: (element, { top, height }, _dx, dy) => {
                    element.style.top = (top + dy) + 'px';
                    element.style.height = (height - dy) + 'px';
                },
            }),
            enableMoving(rightElement, contentElement, {
                readPos: element => {
                    const { width } = element.getBoundingClientRect();
                    return width
                },
                applyDelta: (element, width, dx, _dy) => {
                    element.style.width = (width + dx) + 'px';
                }
            }),
            enableMoving(bottomElement, contentElement, {
                readPos: element => {
                    const { height } = element.getBoundingClientRect();
                    return height;
                },
                applyDelta: (element, height, _dx, dy) => {
                    element.style.height = (height + dy) + 'px';
                }
            }),
            enableMoving(leftElement, contentElement, {
                readPos: element => {
                    const { left, width } = element.getBoundingClientRect();
                    return { left, width };
                },
                applyDelta: (element, { left, width }, dx, _dy) => {
                    element.style.left = (left + dx) + 'px';
                    element.style.width = (width - dx) + 'px';
                }
            }),
        ]);
    }

    componentWillUnmount(): void {
        this.dispose.forEach(dispose => dispose());
    }

    render() {
        const { className, refin } = this.props;
        return <div ref={el => {
            this.contentElement = el;
            refin(el);
        }} className={'resizable' + addClassIfDefined(className)}>
            {this.props.children}
            <div draggable={false} className="resizable-top-bar" ref={el => this.topElement = el}></div>
            <div draggable={false} className="resizable-left-bar" ref={el => this.leftElement = el}></div>
            <div draggable={false} className="resizable-right-bar" ref={el => this.rightElement = el}></div>
            <div draggable={false} className="resizable-bottom-bar" ref={el => this.bottomElement = el}></div>
        </div>
    }
}
