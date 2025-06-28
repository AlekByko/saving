import { cast } from '../shared/core';

export type SortingDirection = 1 | -1;

export function readSortingDirectionOr<Or>(text: string | undefined, or: Or) {
    cast<'-' | '+' | undefined>(text);
    switch (text) {
        case undefined: return 1 as const;
        case '+': return 1 as const;
        case '-': return -1 as const;
        default: return or;
    }
}
