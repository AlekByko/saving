import { isNonNull, isNull } from '../shared/core';

export function readQueryStringListParam<T, A>(
    text: string,
    name: string,
    regex: RegExp,
    parse: (match: RegExpMatchArray) => T | null,
    accumulator: A,
    takeGood: (value: T, accumulator: A) => void,
    takeBad: (text: string, accumulator: A) => void,
    noLuck: (accumulator: A) => void,
) {
    const listReg = new RegExp('[?&]' + name + '=(' + regex.source + '(,' + regex.source + ')*)', 'ig');
    const matched = listReg.exec(text);
    if (isNull(matched)) return noLuck(accumulator);
    const [_full, listText] = matched;
    console.log(matched);
    const itemReg = new RegExp(regex.source, 'ig');
    for (let match = itemReg.exec(listText); isNonNull(match); match = itemReg.exec(listText)) {
        const parsed = parse(match);
        if (isNull(parsed)) {
            const [itemText] = match;
            takeBad(itemText, accumulator);
        } else {
            takeGood(parsed, accumulator);
        }
    }
}

if (window.sandbox === 'reading-list') {
    (function run() {
        const text = 'fshdkjdffh?tags=test,hey,oh';
        const accumulator = { good: [] as string[], bad: [] as string[] };

        readQueryStringListParam(
            text, 'tags', /[\w+\-\_]+/, x => x,
            accumulator,
            ([text], { good }) => good.push(text),
            (text, { bad }) => bad.push(text),
            () => { },
        );

        const { good, bad } = accumulator;
        console.log({ good, bad });
    })();
    (function run() {
        const text = 'fshdkjdffh?favs=-0.1,2.4,4.6,4.8,5,6,7';
        const accumulator = { good: [] as number[], bad: [] as string[] };

        readQueryStringListParam(
            text, 'favs', /-?\d+(\.\d+)*/, ([text]) => {
                const parsed = parseFloat(text);
                if (isFinite(parsed)) return parsed;
                return null;
            },
            accumulator,
            (fav, { good }) => good.push(fav),
            (text, { bad }) => bad.push(text),
            () => { },
        );

        const { good, bad } = accumulator;
        console.log({ good, bad });
    })();
}
