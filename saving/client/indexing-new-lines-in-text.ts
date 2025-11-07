import { isNonNull } from '../shared/core';

export function indexNewLines(text: string) {
    const reg = /\r\n|\n/g;
    let line = -1;
    let startAt = -1;
    reg.lastIndex = -1;
    let first = reg.exec(text);
    while (isNonNull(first)) {
        line += 1;
        let delimAt = first.index;
        const delim = first[0];
        console.log({line, startAt, delimAt, delim});
        console.log(text.substring(startAt, delimAt));
        startAt = delimAt + 1;
        first = reg.exec(text);
    }
    alert('LAST LINE!???');
}


if (window.sandbox === 'indexing-new-lines-in-text') {
    const text = `

a
bcd
ef
ghij`;
    const xxx = indexNewLines(text);
    console.log(xxx);
}
