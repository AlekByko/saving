import { alwaysNull, fail } from '../shared/core';
import { atFull, capturedFrom, Choked, chokedFrom, eofAt, ParsedOrNot, readReg } from '../shared/reading-basics';
import { March } from './template-tokens';

export function readOptions(text: string, index: number, depth: number) {
    const startIndex = 0;
    const { length } = text;
    if (index >= length) return chokedFrom(startIndex, 'Unstarted options.', eofAt(index));
    const result: March[] = [];
    let at = text[index];
    if (at !== '{') return chokedFrom(startIndex, 'No: {');
    while (true) {
        index += 1;
        if (index >= length) return chokedFrom(startIndex, 'Unfinished options.', eofAt(index));
        const match = readMarch(text, index, depth + 1, false, (index, tokens, chocked) => {
            const at = text[index];
            if (at === '|' || at === '}') return capturedFrom(index, tokens);
            return chocked;
        });
        if (match.isBad) return chokedFrom(startIndex, 'Bad option.', match);
        index = match.nextIndex;
        if (index >= length) return chokedFrom(startIndex, 'Unfinished options.', eofAt(index));
        at = text[index];
        switch (at) {
            case '|':
                result.push(match.value);
                continue;
            case '}':
                result.push(match.value);
                index += 1;
                return capturedFrom(index, result);
            default:
                return chokedFrom(startIndex, 'Invalid options.', chokedFrom(index, `Unexpected. Need: "|" or "}".`));
        }
    }
}

function skip(text: string, index: number, reg: RegExp) {
    const skipped = readReg(text, index, reg, alwaysNull);
    if (skipped.isBad) return index;
    return skipped.nextIndex;
}

function readAssignment(text: string, index: number, depth: number) {
    const startIndex = index;
    const { length } = text;
    if (index >= length) return chokedFrom(startIndex, 'EOF at start.');
    index = skip(text, index, /[ ]*/);
    const operator = readReg(text, index, /=/, atFull);
    if (operator.isBad) return chokedFrom(startIndex, 'Bad operator.', operator);
    index = operator.nextIndex;
    index = skip(text, index, /[ ]*/);
    if (index >= length) return chokedFrom(startIndex, 'EOF after operator.', eofAt(index));
    const march = readMarch(text, index, depth + 1, true, (_index, _march, chocked) => chocked);
    if (march.isBad) return chokedFrom(startIndex, 'Bad value.', march);
    index = march.nextIndex;
    return capturedFrom(index, { operator: operator.value, value: march.value });
}

export function readMarch<Unexpected>(
    text: string, index: number, depth: number, shouldStopAtLineBreak: boolean,
    unexpected: (index: number, march: March, choked: Choked) => Unexpected
): ParsedOrNot<March> | Unexpected {
    const result: March = [];
    const startIndex = index;
    const { length } = text;
    if (index > length) return chokedFrom(startIndex, 'Unstarted template.', eofAt(index)); // <--  using index > length, not index >= length, becuase empty string is a valid empty text
    while (true) {
        const literal = shouldStopAtLineBreak
            ? readReg(text, index, /[-,.:_ \w\d]*/, atFull)
            : readReg(text, index, /[-,.:_\s\w\d]*/, atFull);
        if (literal.isBad) return chokedFrom(startIndex, 'Bad literal.', literal);
        if (literal.value.length > 0) {
            result.push({ kind: 'literal', literal: literal.value });
        }
        index = literal.nextIndex;
        if (index >= length) return capturedFrom(index, result);
        let at = text[index];
        switch (at) {
            case '#': {
                debugger;
                index += 1;
                continue;
            }
            case '$':
                const identifier = readReg(text, index, /\$[-_\w\d]+/, atFull);
                if (identifier.isBad) return chokedFrom(startIndex, 'Bad identifier.', identifier);
                index = identifier.nextIndex;
                if (depth > 0) {
                    // assignments cannot be nested into anything, only at depth == 0 (top level)
                    // so here there could not be assignments, only identifiers
                    // so what we have here is an identifier
                    result.push({ kind: 'identifier', identifier: identifier.value });
                    continue;
                } else {
                    const assignment = readAssignment(text, index, depth);
                    if (assignment.isBad) {
                        result.push({ kind: 'identifier', identifier: identifier.value });
                        continue;
                    } else {
                        const { operator, value } = assignment.value;
                        result.push({
                            kind: 'assignment',
                            name: identifier.value,
                            operator,
                            value,
                        });
                        index = assignment.nextIndex;
                        continue;
                    }
                }
            case '{':
                const options = readOptions(text, index, depth + 1);
                if (options.isBad) return chokedFrom(startIndex, 'Bad options.', options);
                index = options.nextIndex;
                result.push({ kind: 'options', options: options.value });
                continue;
            case '\n': {
                if (shouldStopAtLineBreak) {
                    return capturedFrom(index, result);
                } else {
                    return fail('Cannot be here.');
                }
            }
            default:
                return unexpected(
                    index, result,
                    chokedFrom(startIndex, 'Bad march.', chokedFrom(index, 'Unexpected.')),
                );
        }
    }
}


