import { isNonNull } from './shared/core';

export function enableSelecting<At, Item>(
    atOf: (item: Item) => At,
) {

    let startAt: At | null = null;
    function whenClickedCap(at: At, selected: Map<At, boolean>) {
        startAt = at;
        const isSelected = selected.get(at)!;
        const flipped = !isSelected;
        selected.set(at, flipped);
    }

    function whenShiftClickedCap(at: At, all: Item[], selected: Map<At, boolean>): void {
        const isSelected = selected.get(at)!;
        if (isNonNull(startAt)) {
            const endAt = at;
            const flipped = !isSelected;
            let isIn = false;
            for (const item of all) {
                const at = atOf(item);
                if (at === startAt) {
                    isIn = true;
                    selected.set(at, flipped);
                } else if (at === endAt) {
                    isIn = false;
                    selected.set(at, flipped);
                } else if (isIn) {
                    selected.set(at, flipped);
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
