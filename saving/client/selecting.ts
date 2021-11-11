import { isNonNull } from './shared/core';

export function enableSelecting<At, Item>(
    atOf: (item: Item) => At,
    seeWhichComesFirst: (one: At, another: At) => At,
    seeWhichComesLast: (one: At, another: At) => At,
) {

    let startAt: At | null = null;
    function whenClickedCap(at: At, selected: Map<At, boolean>) {
        startAt = at;
        const isSelected = selected.get(at)!;
        const flipped = !isSelected;
        selected.set(at, flipped);
    }

    function whenShiftClickedCap(at: At, all: Item[], selected: Map<At, boolean>, shouldForce: boolean): void {
        const isSelected = selected.get(at)!;
        if (isNonNull(startAt)) {
            const firstAt = seeWhichComesFirst(startAt, at);
            const lastAt = seeWhichComesLast(startAt, at);
            const flipped = !isSelected;
            let isIn = false;
            for (const item of all) {
                const at = atOf(item);
                if (at === firstAt) {
                    isIn = true;
                    if (!selected.has(at) || shouldForce) {
                        selected.set(at, flipped);
                    }
                } else if (at === lastAt) {
                    isIn = false;
                    if (!selected.has(at) || shouldForce) {
                        selected.set(at, flipped);
                    }
                } else if (isIn) {
                    if (!selected.has(at) || shouldForce) {
                        selected.set(at, flipped);
                    }
                } else {
                    // do nothing
                }
            }
        } else {
            startAt = at;
            selected.set(at, true);
        }
    }

    return { whenClickedCap, whenShiftClickedCap };
}
