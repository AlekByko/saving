import { isNonNull } from './shared/core';

export type List<T> = Node<T> | null;
export interface Node<T> {
    value: T;
    rest: List<T>;
}

export function toBeingListOf<T>() {

    function add(list: List<T>, value: T): Node<T> {
        return { value, rest: list };
    }

    function * every(list: List<T>): IterableIterator<T> {
        for (let node = list; isNonNull(node); node = node.rest) {
            yield node.value;
        }
    }

    const empty: List<never> = null;

    return { add, every, empty };
}
