import * as React from 'react';
import * as ReactDom from 'react-dom';
import { isDefined, isNonNull, isNull, isUndefined } from '../shared/core';
import { Point, pointFrom } from './geometry';

export type Regarding<Concern> = (concern: Concern) => void;
export function addClassIf(shouldAdd: boolean, className: string): string {
    return shouldAdd ? ' ' + className : '';
}
export function addClassIfDefined(className: string | undefined): string {
    return isDefined(className) ? ' ' + className : '';
}


export function switchClassOnOff(tokens: DOMTokenList, isOn: boolean, token: string): void {
    const hasIt = tokens.contains(token);
    if (isOn) {
        if (!hasIt) {
            tokens.add(token);
        }
    } else {
        if (hasIt) {
            tokens.remove(token);
        }
    }
}
export function replaceClassIfDefined(tokens: DOMTokenList, classes: string[], token: string | undefined): void {
    classes.forEach(token => tokens.remove(token));
    if (isUndefined(token)) return;
    tokens.add(token);
}


export function toRandKey(): string {
    let key = Math.random();
    key = key * 100000000000;
    key = Math.floor(key);
    return key.toString(16).padStart(11, '0');
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
                // @ts-expect-error
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

export function reFocus(element: HTMLElement | null): void {
    if (isNull(element))
        return;
    element.blur();
    element.focus();
}

/** rumor has it, querying offsetWidth triggers a re-flow */
export function reflowUI(element: HTMLDivElement) {
    void element.offsetWidth;
}
