import { isNonNull, isNull, isUndefined } from './shared/core';

export function extractMany<T>(
    regexp: RegExp,
    text: string,
    make: (matched: RegExpExecArray) => T,
    seeIfGood: (value: T) => boolean,
): T[] {
    const result: T[] = [];
    let matched = regexp.exec(text);
    while (isNonNull(matched)) {
        const value = make(matched);
        if (seeIfGood(value)) {
            result.push(value);
        }
        matched = regexp.exec(text);
    }
    return result;
}


export function extractAt<Or>(regexp: RegExp, text: string, index: number, or: Or): string | Or {
    const matched = regexp.exec(text);
    if (isNull(matched)) return or;
    const found = matched[index] as string | undefined;
    if (isUndefined(found)) return or;
    return found;
}

export function extractBetweenOr<Or>(text: string, start: string, end: string, or: Or): string | Or {
    const foundAt = text.indexOf(start, 0);
    if (foundAt < 0) return or;
    const startsAt = foundAt + start.length;
    const endsAt = text.indexOf(end, startsAt);
    const value = text.substring(startsAt, endsAt);
    return value;
}
