import { isNonNull } from './shared/core';

export interface SelectingDefaults<Order, Item, Selected> {
    orderOf: (item: Item) => Order;
    coordsOf: (item: Item) => [number, number];
    seeIfSet: (item: Item) => boolean;
    seeWhichComesFirst: (one: Order, another: Order) => Order;
    seeWhichComesLast: (one: Order, another: Order) => Order;
    seeIfHasAny: (selected: Selected) => boolean;
    seeIfSelected: (selected: Selected, item: Item) => boolean;
    makeSelected: (selected: Selected, item: Item) => void;
    makeUnselected: (selected: Selected, item: Item) => void;
    makeAllUnselected: (selected: Selected, item: Item[]) => void;
}

export function enableSelecting<Order, Item, Selected>(defaults: SelectingDefaults<Order, Item, Selected>) {

    const {
        orderOf, coordsOf, seeIfSet,
        seeWhichComesFirst, seeWhichComesLast,
        seeIfSelected, makeSelected, makeUnselected,
     } = defaults;

    let startItem: Item | null = null;

    function setDefault(item: Item): void {
        startItem = item;
    }

    function whenClicked(item: Item, selected: Selected) {
        startItem = item;
        const isSelected = seeIfSelected(selected, item);
        const flipped = !isSelected;
        if (flipped === true) {
            makeSelected(selected, item);
        } else {
            makeUnselected(selected, item);
        }
    }

    function whenShiftClicked(
        item: Item,
        all: Item[],
        selected: Selected,
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
                    const isSet = seeIfSet(item);
                    const isIn = col >= firstCol && col <= lastCol && row >= firstRow && row <= lastRow;
                    if (isIn) {
                        if (seeIfCanSet(isSet, shouldForce)) {
                            makeSelected(selected, item);
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
                    const isSet = seeIfSet(nextItem);
                    if (order === firstOrder) {
                        isIn = true;
                        if (seeIfCanSet(isSet, shouldForce)) {
                            makeSelected(selected, nextItem);
                        }
                    } else if (order === lastOrder) {
                        isIn = false;
                        if (seeIfCanSet(isSet, shouldForce)) {
                            makeSelected(selected, nextItem);
                        }
                    } else if (isIn) {
                        if (seeIfCanSet(isSet, shouldForce)) {
                            makeSelected(selected, nextItem);
                        }
                    } else {
                        // do nothing
                    }
                }
            }
        } else {
            // doing single
            startItem = item;
            makeSelected(selected, item);
        }
    }

    return { whenClicked, whenShiftClicked, setDefault };
}
function seeIfCanSet(isSet: boolean, shouldForce: boolean): boolean {
    return !isSet || shouldForce;
}

