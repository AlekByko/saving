import { binarySearch, compareNumbers, isNonNull, isNull } from '../shared/core';


interface LineInfo {
    lineIndex: number;
    startAt: number;
    endAt: number;
}
export function indexNewLines(text: string): LineInfo[] {

    const reg = /\n/g;
    let lineIndex = -1;
    let startAt = 0;
    reg.lastIndex = -1;
    let first = reg.exec(text);
    const result: LineInfo[] = [];
    while (isNonNull(first)) {
        lineIndex += 1;
        let delimAt = first.index;
        // const delim = first[0];
        // console.log({ lineIndex, startAt, delimAt, delim, line: '_' + text.substring(startAt, delimAt) + '_' });
        result.push({ lineIndex, startAt, endAt: delimAt });
        startAt = delimAt + 1;
        first = reg.exec(text);
    }
    if (startAt <= text.length) {
        lineIndex += 1;
        const endAt = text.length;
        result.push({ lineIndex, startAt, endAt });
        // console.log({ lineIndex, startAt, endAt, line: '_' + text.substring(startAt, endAt) + '_' });
    }
    return result;
}

function findLineInfo(indexed: LineInfo[], charAt: number): LineInfo | null {
    let lineAt = binarySearch(indexed, charAt, x => x.startAt, compareNumbers, 0);
    if (lineAt < 0) {
        // since complemented index points at the next line info
        // we have to go back one step, hence: -1
        lineAt = ~lineAt - 1;
    }
    if (lineAt < 0) return null;
    if (lineAt >= indexed.length) return null;
    const info = indexed[lineAt];
    const { startAt, endAt } = info;
    if (charAt < startAt) return null;
    if (charAt > endAt) return null;
    return info;
}

function findCharPos(indexed: LineInfo[], charAt: number) {
    const info = findLineInfo(indexed, charAt);
    if (isNull(info)) return null;
    const row = info.lineIndex;
    const col = charAt - info.startAt;
    return { row, col };
}

if (window.sandbox === 'indexing-new-lines-in-text') {
    function test(char: string, text: string) {
        const indexed = indexNewLines(text);
        const charAt = text.indexOf(char);
        console.log(char, charAt, text);
        const info = findLineInfo(indexed, charAt);
        console.log(info);
        console.log(findCharPos(indexed, charAt));
    }
    const text = `abc
de

f`
    test('a', text);
    test('b', text);
    test('c', text);
    test('d', text);
    test('e', text);
    test('f', text);
}


if (window.sandbox === 'indexing-new-lines-in-text' && 2 < 1) {
    function test(text: string) {
        console.log('_' + text + '_');
        const indexed = indexNewLines(text);
        console.log(indexed);
    }
    test(``);
    test(`
`);
    test(`xyz`);
    test(`

a
bcd
ef
ghij`);
}
