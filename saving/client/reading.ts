import { eoffedFrom, jammedFrom, passedFrom, Read, Tried } from './parsed';
import { isNull } from './shared/core';

export function toWholeSubstring(_matched: string[], start: number, index: number, text: string): string {
    return text.substring(start, index);
}
export function readWholeRegexp(index: number, text: string, regexp: RegExp) {
    return readRegexp(index, text, regexp, toWholeSubstring);
}

type Make<T> = (matched: string[], start: number, index: number, text: string) => T;

export function readRegexp<T>(
    index: number, text: string, regexp: RegExp,
    make: Make<T>,
) {
    regexp.lastIndex = index;
    const matched = regexp.exec(text);
    if (isNull(matched)) return jammedFrom(index);
    const end = index + matched[0].length;
    const made = make(matched, index, end, text);
    return passedFrom(index, end, made);
}


export function readWholeRegexpOver(regexp: RegExp) {
    return function readWholeRegexpUnder(index: number, text: string) {
        return readRegexp(index, text, regexp, toWholeSubstring);
    };
}

export function readRegexpOver<T>(regexp: RegExp, make: Make<T>) {
    return function readRegexpUnder(index: number, text: string) {
        return readRegexp(index, text, regexp, make);
    };
}

export function readListOver<V, D, R>(
    index: number,
    text: string,
    readValue: Read<V>,
    readDelim: Read<D>,
    make: (value: V) => R,
    add: (result: R, value: V, delim: D) => R,
): Tried<R> {
    if (index >= text.length) return eoffedFrom(text.length);
    const first = readValue(index, text);
    if (first.isJammed) return first;
    let result = make(first.value);
    let last = first;
    while (true) {
        const delim = readDelim(last.index, text);
        if (delim.isJammed) return passedFrom(index, last.index, result);
        const next = readValue(delim.index, text);
        if (next.isJammed) return passedFrom(index, last.index, result);
        result = add(result, next.value, delim.value);
        last = next;
    }
}

