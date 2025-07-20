import { fail } from './core';
import { Captured, capturedFrom, Choked, Read } from './reading-basics';

export function readLoopOver<T, R>(
    read: Read<T>,
    readDelim: Read<null>,
    makeResult: (value: T) => R,
    add: (result: R, value: T) => R,
    min: number,
    max: number,
): Read<R> {
    if (min < 1) return fail('Min has to be > 0.');
    return function readLoopUnder(text, start) {
        const first = read(text, start);
        if (first.isBad) return first;

        let pastLastIndex = first.index;
        let index = first.index;

        let result = makeResult(first.value);
        let times = 1;
        while (times < max) {

            const delim = readDelim(text, index);
            if (delim.isBad) {
                if (times < min) return delim;
                return capturedFrom(pastLastIndex, result);
            } else {
                index = delim.index;
            }
            const next = read(text, index);
            if (next.isBad) {
                if (times < min) return next;
                return capturedFrom(pastLastIndex, result);
            } else {
                pastLastIndex = index = next.index;
                result = add(result, next.value);
            }

            times += 1;
        }
        return capturedFrom(pastLastIndex, result);
    };
}

export function readList<Item>(
    text: string, index: number,
    readItem: Read<Item>,
    readDelim: Read<unknown>,
): Choked | Captured<Item[]> {
    const first = readItem(text, index);
    if (first.isBad) return first;
    const items = [first.value];
    index = first.index;
    while (true) {
        const delim = readDelim(text, index);
        if (delim.isBad) break;
        index = delim.index;
        const next = readItem(text, index);
        if (next.isBad) return next;
        items.push(next.value);
        index = next.index;
    }
    return capturedFrom(index, items);
}
