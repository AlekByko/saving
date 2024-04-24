import { isNonNull } from './shared/core';

export interface SelectingDefaults<Order, Item>{
    orderOf: (item: Item) => Order;
    coordsOf: (item: Item) => [number, number];
    isSetOf: (item: Item) => boolean;
    seeWhichComesFirst: (one: Order, another: Order) => Order;
    seeWhichComesLast: (one: Order, another: Order) => Order;
}

export function enableSelecting<Order, Item>(defaults: SelectingDefaults<Order, Item>) {

    const { orderOf, coordsOf, isSetOf, seeWhichComesFirst, seeWhichComesLast } = defaults;

    let startItem: Item | null = null;

    function setDefault(item: Item): void {
        startItem = item;
    }

    function whenClicked(item: Item, selected: Map<Order, boolean>) {
        startItem = item;
        const order = orderOf(item);
        const isSelected = selected.get(order)!;
        const flipped = !isSelected;
        selected.set(order, flipped);
    }

    function whenShiftClicked(
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
                let isIn = false;
                for (const nextItem of all) {
                    const order = orderOf(nextItem);
                    const isSet = isSetOf(nextItem);
                    if (order === firstOrder) {
                        isIn = true;
                        if (seeIfCanSet(isSet, shouldForce)) {
                            selected.set(order, true);
                        }
                    } else if (order === lastOrder) {
                        isIn = false;
                        if (seeIfCanSet(isSet, shouldForce)) {
                            selected.set(order, true);
                        }
                    } else if (isIn) {
                        if (seeIfCanSet(isSet, shouldForce)) {
                            selected.set(order, true);
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

    return { whenClicked, whenShiftClicked, setDefault };
}
function seeIfCanSet(isSet: boolean, shouldForce: boolean): boolean {
    return !isSet || shouldForce;
}

