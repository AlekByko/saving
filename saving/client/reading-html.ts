import { atomicTagFrom, Attribute, closingTagFrom, Html, openingTagFrom, textFrom, whitespace } from './html';
import { Eoffed, eoffedFrom, Jammed, jammedFrom, Passed, passedFrom, Tried } from './parsed';
import { readListOver, readRegexp, readRegexpOver, readWholeRegexp } from './reading';
import { readSequentially } from './reading-sequentially';
import { append } from './shared/arrays';
import { alwaysNull } from './shared/core';

export function readHtml<R>(
    index: number,
    text: string,
    result: R,
    take: (result: R, html: Passed<Html> | Eoffed | Jammed) => R,
): R {
    console.log(text);
    const { length } = text;
    while (index < length) {
        const read = readAnything(index, text);
        if (read.isJammed) {
            return take(result, read);
        }
        result = take(result, read);
        index = read.index;
    }
    return take(result, eoffedFrom(index));
}

export const readDeclaration = readSequentially
    .take(readRegexpOver(/<!DOCTYPE html/iy, alwaysNull))

    .take(readRegexpOver(/ public "([^"]+)"/iy, ([, id]) => id || undefined))
    .or(undefined)
    .add((_, id) => ({ public: id }))

    .take(readRegexpOver(/ (system )?"([^"]+)"/iy, ([, , id]) => id || undefined))
    .or(undefined)
    .add((sofar, id) => ({...sofar, system: id}))

    .skip(readRegexpOver(/\s+?>/y, alwaysNull))
    .read;

export function readAnything(start: number, text: string) {
    let index = start;
    if (index >= text.length) return eoffedFrom(index);
    const at = text[index];
    switch (at) {
        case ' ': case '\n': case '\r': case '\t':
            return keepReadingWhitespace(index, text);
        case '<': return readTag(index, text);
        default: return keepReadingText(index, text);
    }
}

export function keepReadingText(start: number, text: string) {
    const index = start + 1;
    if (index >= text.length) return passedFrom(start, text.length, textFrom(text.substr(index)));
    return readRegexp(index, text, /[^<]+/y, (_match, _start, end, text) => textFrom(text.substr(start, end)));
}

export function keepReadingWhitespace(start: number, text: string) {
    const index = start + 1;
    if (index >= text.length) return passedFrom(start, text.length, whitespace);
    const space = readWholeRegexp(index, text, /[\s\n\r]*/y);
    if (space.isJammed) return space;
    return passedFrom(start, space.index, whitespace);
}

export function isWhitespace(at: string) {
    switch (at) {
        case ' ': case '\t': case '\n': case '\r': return true;
        default: return false;
    }
}

export function isAlpha(at: string) {
    return /[a-zA-Z]/.test(at);
}

export function readAttributes(index: number, text: string): Tried<Attribute[]> {
    return readListOver(
        index, text,
        readAttribute, readExpectedWhitespace,
        attr => [attr], (result, attr) => append(result, attr),
    );
}

export const readAttribute = readRegexpOver(
    /([a-zA-Z-]+)=("([^"]+)"|'([^'])+')/y,
    ([_whole, name, , doubleQuoted, singleQuoted]) => ({ name, value: doubleQuoted || singleQuoted }),
);

export function readExpectedWhitespace(index: number, text: string) {
    if (index >= text.length) return eoffedFrom(text.length);
    const space = readRegexp(index, text, /[\s\n\r\t]+/y, alwaysNull);
    if (space.isJammed) return space;
    return passedFrom(index, space.index, whitespace);
}

export function readTag(start: number, text: string) {
    let index = start + 1;
    if (index >= text.length) return eoffedFrom(text.length);
    const isClosing = text[index] === '/';
    if (isClosing) index += 1;
    const name = readWholeRegexp(index, text, /[a-zA-Z]+/y);
    if (name.isJammed) return name;
    index = name.index;
    if (isWhitespace(text[index])) {
        index = keepReadingWhitespace(index, text).index;
    }
    const attributes = isAlpha(text[index])
        ? readAttributes(index, text)
        : jammedFrom(index);
    index = attributes.index;
    const space = readExpectedWhitespace(index, text);
    index = space.index;
    const isAtomic = text[index] === '/';
    if (isAtomic) {
        index += 1;
    }
    if (text[index] !== '>') return jammedFrom(index);
    index += 1;
    const tag = isClosing
        ? closingTagFrom(name.value)
        : isAtomic
            ? atomicTagFrom(name.value, attributes.isJammed ? null : attributes.value)
            : openingTagFrom(name.value, attributes.isJammed ? null : attributes.value);
    return passedFrom(start, index, tag);
}


