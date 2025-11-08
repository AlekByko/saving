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
export function stripAllComments(text: string) {
    text = stripSlashStarComments(text);
    return text;
}

export function normalizeNewLines(text: string): string {
    text = text // <-------------------------------------HAS TO BE DONE OUTSIDE!!
        .replace('\r\n', '\n')
        .replace('\r', '\n');
    return text;
}

if (window.sandbox === 'executing-prompt-template') {
    console.log(stripAllComments(`
a b c _/* fffuck!!!!
*/_ d _/**/_ e
`));
    console.log(stripAllComments(`/**/`));
}
