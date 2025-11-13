import { isNull, isUndefined } from '../shared/core';
import { dumpChockedAndContext } from '../shared/reading-basics';
import { Random } from './randomizing';
import { readMarch } from './reading-templates';
import { normalizeNewLines, stripAllComments } from './stripping-comments';
import { March, Token } from './template-tokens';


type Variables = Map<string, string>;
function renderToken(token: Token, random: Random, variables: Variables): string | null {
    switch (token.kind) {
        case 'literal': return token.literal;
        case 'options': {
            const { options } = token;
            const option = random.pick(options);
            return renderMarch(option, random, variables);
        }
        case 'identifier': {
            const { identifier } = token;
            const rendered = variables.get(identifier);
            if (isUndefined(rendered)) return '___' + identifier + '___';
            return rendered;
        }
        case 'assignment': {
            const { name, value } = token;
            if (variables.has(name)) return '~!~' + name + '~!~';
            const rendered = renderMarch(value, random, variables);
            variables.set(name, rendered);
            return null;
        }

    }
}

function renderMarch(march: March, random: Random, variables: Variables): string {
    const chunks: string[] = [];
    for (const token of march) {
        const chunk = renderToken(token, random, variables);
        if (isNull(chunk)) continue;
        chunks.push(chunk);
    }
    return chunks.join('').split('\n').filter(x => x.trim() !== '').join(' ');
}

export function executeTemplate(text: string, seed: number) {
    text = normalizeNewLines(text);
    text = stripAllComments(text);
    const random = new Random(seed);
    const march = readMarch(text, 0, 0, false, (_index, _march, chocked) => chocked);
    if (march.isBad) return (console.log(march), console.log(dumpChockedAndContext(march, text)), 'BAD MARCH');
    const variables = new Map<string, string>();
    text = renderMarch(march.value, random, variables);
    return text;
}
