import { cast } from '../shared/core';

export type SortingSign = 1 | -1;

export function readSortingSignOr<Or>(text: string | undefined, or: Or) {
    cast<'-' | '+' | undefined>(text);
    switch (text) {
        case undefined: return 1 as const;
        case '+': return 1 as const;
        case '-': return -1 as const;
        default: return or;
    }
}
