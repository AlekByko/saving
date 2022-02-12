import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Point, pointFrom } from './geometry';
import { isDefined, isNonNull } from './shared/core';

export type Regarding<Concern> = (concern: Concern) => void;
export function addClassIf(shouldAdd: boolean, className: string): string {
    return shouldAdd ? ' ' + className : '';
}
export function addClassIfDefined(className: string | undefined): string {
    return isDefined(className) ? ' ' + className : '';
}
let lastKey = 0;
export function toNextKey(): string {
    return 'key#' + (lastKey++);
}

export function atBottomLeft(element: HTMLElement): Point {
    const { left: x, bottom: y } = element.getBoundingClientRect();
    return pointFrom(x, y);
}

export function atTopRight(element: HTMLElement): Point {
    const { right: x, top: y } = element.getBoundingClientRect();
    return pointFrom(x, y);
}

export const atZero: Point = { x: 0, y: 0 };

export type PropsOf<C> = C extends React.ComponentClass<infer Props> ? Props : never;
export type ReactConstructor<Props> = new (props: Props) => React.Component<Props>;
export type Rendered = JSX.Element | null;

export function willRerenderOver<Props>(Root: ReactConstructor<Props>, rootElement: HTMLElement) {
    return function willRender(props: Props): Promise<void> {
        return new Promise<void>(resolve => {
            ReactDom.render(
                <Root {...props} />, rootElement,
                () => resolve(),
            );
        });
    };
}

export function openLink(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.target = 'hidden';
    link.click();
}

export function seeIfReffed<Element>(
    ref: React.Ref<Element>,
): ref is React.RefObject<Element> & { current: Element; } {
    return isNonNull(ref)
    && !(ref instanceof Function)
    && isNonNull(ref.current)
}
