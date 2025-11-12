import React from 'react';
import { isNull } from '../shared/core';
import { Box } from '../shared/shapes';
import { addClassIfDefined } from './reacting';

export function enableMoving<Pos>(
    handleElement: HTMLElement,
    contentElement: HTMLElement,
    defaults: {
        readPos: (element: HTMLElement) => Pos;
        applyDelta: (element: HTMLElement, pos: Pos, dx: number, dy: number) => void;
        reportPos: (pos: Pos, dx: number, dy: number) => void;
    },
) {

    function whenMousedown(e: MouseEvent) {
        const startX = e.pageX;
        const startY = e.pageY;
        const startPos = defaults.readPos(contentElement);

        document.addEventListener('mousemove', whenMousemove);
        document.addEventListener('mouseup', whenMouseup);

        function whenMouseup(e: MouseEvent) {
            document.removeEventListener('mouseup', whenMouseup);
            document.removeEventListener('mousemove', whenMousemove);
            const dx = e.pageX - startX;
            const dy = e.pageY - startY;
            defaults.reportPos(startPos, dx, dy);
        }

        function whenMousemove(e: MouseEvent) {
            const dx = e.pageX - startX;
            const dy = e.pageY - startY;
            defaults.applyDelta(contentElement, startPos, dx, dy);
        }
    }

    handleElement.addEventListener('mousedown', whenMousedown);

    return function dispose() {
        handleElement.removeEventListener('mousedown', whenMousedown);
    };
}
export interface ResizableProps {
    className?: string;
    box: Box;
    onChanged: (box: Partial<Box>) => void;
    refin: (element: HTMLElement | null) => void;
}
export class Resizable extends React.Component<ResizableProps> {

    private contentElement: HTMLElement | null = null;

    private bottomElement: HTMLDivElement | null = null;
    private topElement: HTMLDivElement | null = null;
    private leftElement: HTMLDivElement | null = null;
    private rightElement: HTMLDivElement | null = null;

    private topLeftElement: HTMLDivElement | null = null;
    private topRightElement: HTMLDivElement | null = null;
    private bottomRightElement: HTMLDivElement | null = null;
    private bottomLeftElement: HTMLDivElement | null = null;

    dispose = [] as Act[];
    componentDidMount(): void {
        const {
            contentElement,
            topElement, rightElement, bottomElement, leftElement,
            topRightElement, topLeftElement, bottomRightElement, bottomLeftElement,
        } = this;
        if (isNull(contentElement) || isNull(topElement) || isNull(rightElement) || isNull(bottomElement) || isNull(leftElement)) return;
        if (isNull(topRightElement) || isNull(topLeftElement) || isNull(bottomRightElement) || isNull(bottomLeftElement)) return;
        const { x, y, width, height } = this.props.box;
        contentElement.style.left = x + 'px';
        contentElement.style.top = y + 'px';
        contentElement.style.width = width + 'px';
        contentElement.style.height = height + 'px';
        this.dispose.push(...[
            enableMoving(topRightElement, contentElement, {
                readPos: element => {
                    const { top, height, width } = element.getBoundingClientRect();
                    return { top, height, width };
                },
                applyDelta: (element, { top, height, width }, dx, dy) => {
                    element.style.top = (top + dy) + 'px';
                    element.style.height = (height - dy) + 'px';
                    element.style.width = (width + dx) + 'px';
                },
                reportPos: ({ top: y, height, width }, dx, dy) => {
                    y += dy;
                    height -= dy;
                    width += dx;
                    this.props.onChanged({ y, height, width });
                },
            }),
            enableMoving(topLeftElement, contentElement, {
                readPos: element => {
                    const { top, left, height, width } = element.getBoundingClientRect();
                    return { top, left, height, width };
                },
                applyDelta: (element, { top, left, width, height }, dx, dy) => {
                    element.style.left = (left + dx) + 'px';
                    element.style.top = (top + dy) + 'px';
                    element.style.width = (width - dx) + 'px';
                    element.style.height = (height - dy) + 'px';
                },
                reportPos: ({ top: y, left: x, height, width }, dx, dy) => {
                    x += dx;
                    y += dy;
                    width -= dx;
                    height -= dy;
                    this.props.onChanged({ x, y, height, width });
                },
            }),
            enableMoving(topElement, contentElement, {
                readPos: element => {
                    const { top, height } = element.getBoundingClientRect();
                    return { top, height };
                },
                applyDelta: (element, { top, height }, _dx, dy) => {
                    element.style.top = (top + dy) + 'px';
                    element.style.height = (height - dy) + 'px';
                },
                reportPos: ({ top: y, height }, _dx, dy) => {
                    y += dy;
                    height -= dy;
                    this.props.onChanged({ y, height });
                },
            }),
            enableMoving(rightElement, contentElement, {
                readPos: element => {
                    const { width } = element.getBoundingClientRect();
                    return width
                },
                applyDelta: (element, width, dx, _dy) => {
                    element.style.width = (width + dx) + 'px';
                },
                reportPos: (width, dx, _dy) => {
                    width += dx;
                    this.props.onChanged({ width });
                }
            }),
            enableMoving(bottomElement, contentElement, {
                readPos: element => {
                    const { height } = element.getBoundingClientRect();
                    return height;
                },
                applyDelta: (element, height, _dx, dy) => {
                    element.style.height = (height + dy) + 'px';
                },
                reportPos: (height, _dx, dy) => {
                    height += dy;
                    this.props.onChanged({ height });
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
                },
                reportPos: ({ left: x, width }, dx, _dy) => {
                    x += dx;
                    width -= dx;
                    this.props.onChanged({ x, width });
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
            <div draggable={false} className="resizable-top-left-corner" ref={el => this.topLeftElement = el}></div>
            <div draggable={false} className="resizable-top-right-corner" ref={el => this.topRightElement = el}></div>
            <div draggable={false} className="resizable-bottom-left-corner" ref={el => this.bottomLeftElement = el}></div>
            <div draggable={false} className="resizable-bottom-right-corner" ref={el => this.bottomRightElement = el}></div>
        </div>
    }
}
