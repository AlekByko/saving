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
