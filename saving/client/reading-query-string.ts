import { isNull } from '../shared/core';

export function readQueryStringLiteralParam<S extends string, Or>(
    regexp: RegExp, seeIfValid: (x: string) => x is S, or: Or
): S | Or {
    const matched = regexp.exec(window.location.search);
    if (isNull(matched)) return or;
    const [_full, value] = matched;
    if (seeIfValid(value)) return value;
    return or;
}
export function readStringFromQueryStringOr<Or>(regexp: RegExp, or: Or) {
    const matched = regexp.exec(window.location.search);
    if (isNull(matched)) return or;
    const [_full, value] = matched;
    return value;
}

export function readNumberFromQueryString<Or>(
    regexp: RegExp, or: Or
): number | Or {
    const matched = regexp.exec(window.location.search);
    if (isNull(matched)) return or;
    const [_full, text] = matched;
    const parsed = parseInt(text, 10);
    if (isFinite(parsed)) return parsed;
    return or;
}

export function testQueryString(regexp: RegExp): boolean {
    return regexp.test(window.location.search);
}


export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function readBoxOr<Or>(regexp: RegExp, or: Or): Box | Or {
    const matched = regexp.exec(window.location.search);
    if (isNull(matched)) return or;
    const [_full, textX, textY, textWidth, textHeight] = matched;
    const x = parseInt(textX, 10);
    const y = parseInt(textY, 10);
    const width = parseInt(textWidth, 10);
    const height = parseInt(textHeight, 10);
    return { x, y, width, height };
}
