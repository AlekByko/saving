import { broke } from '../shared/core';

function bad(message: string): undefined {
    console.log(message);
    return undefined;
}

export function skipJson(text: string, index: number): undefined | number {
    const stack: ('start' | 'in-obj' | 'in-string')[] = [];
    while (index < text.length) {
        const at = text[index];
        const state = stack.length > 0 ? stack[stack.length - 1] : 'start';
        switch (state) {
            case 'start': {
                switch (at) {
                    case '{': {
                        stack.push('in-obj');
                        index += 1;
                        continue;
                    }
                    default: return bad(`no "{" at start ${index}: ${at}`);
                }
            }
            case 'in-obj': {
                switch (at) {
                    case '}': {
                        stack.pop();
                        index += 1;
                        if (stack.length < 1) return index; // <-- DONE!
                        continue;
                    }
                    case '"': {
                        stack.push('in-string');
                        index += 1;
                        continue;
                    }
                    default: {
                        index += 1;
                        continue;
                    }
                }
            }
            case 'in-string': {
                switch (at) {
                    case '\\': {
                        index += 2;
                        continue;
                    }
                    case '"': {
                        stack.pop();
                        index += 1;
                        continue;
                    }
                    default: {
                        index += 1;
                        continue;
                    }
                }
            }
            default: return broke(state);
        }

    }
    return bad(`end of text`);
}
