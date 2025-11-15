export function stripSlashStarComments(text: string) {
    let at = 0;
    while (true) {
        const startAt = text.indexOf('/*', at);
        if (startAt < 0) return text;
        at = startAt;
        const endAt = text.indexOf('*/', at);
        if (endAt < 0) return text;
        text = text.substring(0, startAt) + text.substring(endAt + 2);
        at = startAt; // because in new text we cut out entire comment past start marker
    }
}

export function stripDoublSlashComments(text: string): string {
    let at = 0;
    while (true) {
        const startAt = text.indexOf('//', at);
        if (startAt < 0) return text;
        const delimAt = text.indexOf('\n', startAt);
        if (delimAt < 0) return text.substring(0, startAt);
        text = text.substring(0, startAt) + text.substring(delimAt);
        at = startAt + 1;
    }
}
export function stripAllComments(text: string) {
    text = stripSlashStarComments(text);
    text = stripDoublSlashComments(text);
    return text;
}

export function normalizeNewLines(text: string): string {
    text = text // <-------------------------------------HAS TO BE DONE OUTSIDE!!
        .replace('\r\n', '\n')
        .replace('\r', '\n');
    return text;
}

if (window.sandbox === 'stripping-comments') {
    type Same<T> = (value: T) => T;
    function test(strip: Same<string>, text: string, expected: string) {
        const stripped = strip(text);
        if (stripped === expected) {
            console.log('PASSED: ' + text);
        } else {
            console.group('FAILED');
            console.log(text);
            console.log(expected);
            console.log(stripped);
            console.groupEnd();
        }
    }

    test(stripDoublSlashComments, `// test`, '');
    test(stripDoublSlashComments, `// test
// another test`, `
`);
    test(stripDoublSlashComments, `abc`, `abc`);
    test(stripDoublSlashComments, `a // bc
d // efg`, `a `+
`
d `);

    console.log(stripAllComments(`
a b c _/* ddduck!!!!
*/_ d _/**/_ e
`));
    console.log(stripAllComments(`/**/`));
}
