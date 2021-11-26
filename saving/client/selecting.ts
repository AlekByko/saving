import { isNonNull } from './shared/core';

export function enableSelecting<Order, Item>(
    orderOf: (item: Item) => Order,
    coordsOf: (item: Item) => [number, number],
    isSetOf: (item: Item) => boolean,
    seeWhichComesFirst: (one: Order, another: Order) => Order,
    seeWhichComesLast: (one: Order, another: Order) => Order,
) {

    let startItem: Item | null = null;
    function whenClickedCap(item: Item, selected: Map<Order, boolean>) {
        startItem = item;
        const order = orderOf(item);
        const isSelected = selected.get(order)!;
        const flipped = !isSelected;
        selected.set(order, flipped);
    }

    function whenShiftClickedCap(
        item: Item,
        all: Item[],
        selected: Map<Order, boolean>,
        shouldForce: boolean,
        shouldSquare: boolean,
    ): void {
        if (isNonNull(startItem)) {
            if (shouldSquare) {
                // doing square range
                const endItem = item;
                const [startCol, startRow] = coordsOf(startItem);
                const [endCol, endRow] = coordsOf(endItem);
                const firstCol = Math.min(startCol, endCol);
                const firstRow = Math.min(startRow, endRow);
                const lastCol = Math.max(startCol, endCol);
                const lastRow = Math.max(startRow, endRow);
                for (const item of all) {
                    const [col, row] = coordsOf(item);
                    const isSet = isSetOf(item);
                    const isIn = col >= firstCol && col <= lastCol && row >= firstRow && row <= lastRow;
                    if (isIn) {
                        const order = orderOf(item);
                        if (seeIfCanSet(isSet, shouldForce)) {
                            selected.set(order, true);
                        }
                    } else {
                        // do nothing
                    }
                }
            } else {
                // doing order range
                const startOrder = orderOf(startItem);
                const endOrder = orderOf(item);
                const firstOrder = seeWhichComesFirst(startOrder, endOrder);
                const lastOrder = seeWhichComesLast(startOrder, endOrder);
                const isSelected = selected.get(endOrder)!;
                const flipped = !isSelected;
                let isIn = false;
                for (const nextItem of all) {
                    const order = orderOf(nextItem);
                    const isSet = isSetOf(item);
                    if (order === firstOrder) {
                        isIn = true;
                        if (seeIfCanSet(isSet, shouldForce)) {
                            selected.set(order, flipped);
                        }
                    } else if (order === lastOrder) {
                        isIn = false;
                        if (seeIfCanSet(isSet, shouldForce)) {
                            selected.set(order, flipped);
                        }
                    } else if (isIn) {
                        if (seeIfCanSet(isSet, shouldForce)) {
                            selected.set(order, flipped);
                        }
                    } else {
                        // do nothing
                    }
                }
            }
        } else {
            // doing single
            startItem = item;
            const order = orderOf(item);
            selected.set(order, true);
        }
    }

    return { whenClickedCap, whenShiftClickedCap };
}
function seeIfCanSet(isSet: boolean, shouldForce: boolean) {
    return !isSet || shouldForce;
}

