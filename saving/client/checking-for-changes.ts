import { isNonNull, isNull } from './shared/core';

export type ChangedOrNot = string | null;
export function checkIfDifferentOver<T, V>(
    valueOf: (parent: T) => V,
    areDifferent: (before: V, after: V) => boolean,
    here: string,
) {
    return function checkIfChanged(before: T, after: T): ChangedOrNot {
        const beforeValue = valueOf(before);
        const afterValue = valueOf(after);
        const isDifferent = areDifferent(beforeValue, afterValue);
        if (isDifferent) {
            return here;
        }
        return null;
    };
}
export function checkIfChangedOver<T, V>(
    valueOf: (parent: T) => V,
    checkIfChanged_: (before: V, after: V, ) => ChangedOrNot,
    here: string,
) {
    return function checkIfChanged(before: T, after: T): ChangedOrNot {
        const beforeValue = valueOf(before);
        const afterValue = valueOf(after);
        const changed = checkIfChanged_(beforeValue, afterValue);
        if (isNonNull(changed)) {
            return here + '/' + changed;
        }
        return null;
    };
}
export function checkingOf<T>(): ChangeChecker<T> {
    return new ChangeChecker<T>();
}

export type CheckIfChanged<T> = (before: T, after: T) => ChangedOrNot;
export class ChangeChecker<T> {
    private all: CheckIfChanged<T>[] = [];
    each(each: (self: this) => T) {
        each(this);
        return this;
    }
    different<V>(
        here: keyof T & string,
        valueOf: (parent: T) => V,
        seeIfDifferent: (before: V, after: V) => boolean,
    ): never {
        const seeIfChanged = checkIfDifferentOver(valueOf, seeIfDifferent, here);
        this.all.push(seeIfChanged);
        return undefined!;
    }
    changed<V>(
        here: keyof T & string,
        valueOf: (parent: T) => V,
        checkIfChanged_: (before: V, after: V) => ChangedOrNot,
    ): never {
        const seeIfChanged = checkIfChangedOver(valueOf, checkIfChanged_, here);
        this.all.push(seeIfChanged);
        return undefined!;
    }
    done(): CheckIfChanged<T> {
        const { all } = this;
        return function checkIfChanged(before, after): ChangedOrNot {
            for (let index = 0; index < all.length; index++) {
                const checkIfChanged = all[index];
                const checked = checkIfChanged(before, after);
                if (isNull(checked)) continue;
                return checked;
            }
            return null;
        }
    }
}
