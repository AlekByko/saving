import { compareRandom } from './core';

module arrays {

    export function shuffleBetter<T>(values: T[]): T[] {
        const random = values.map(value => ({ value, rand: Math.random() }));
        random.sort(function (a, b) { return a.rand - b.rand; });
        return random.map(x => x.value);
    }

    export function shuffleQuick<T>(values: T[]): void {
        values.sort(compareRandom);
    }


    export function foldArray<T, R>(values: T[], result: R, fold: (result: R, value: T, index: number) => R): R {
        return values.reduce(fold, result);
    }
    export function times(count: number, initial = 0): number[] {
        const result: number[] = [];
        for (let index = 0; index < count; index++) {
            result.push(initial + index);
        }
        return result;
    }

    export function countThoseThat<T>(
        values: ReadonlyArray<T>,
        isThat: (value: T, index: number) => boolean,
    ): number {
        let count = 0;
        for (let index = 0; index < values.length; index++) {
            if (isThat(values[index], index)) {
                count += 1;
            }
        }
        return count;
    }

    export function checkIfAllSomeOrNone<T>(
        items: ReadonlyArray<T>,
        isIt: (value: T) => boolean,
    ): 'all' | 'some' | 'none' {
        const count = countThoseThat(items, isIt);
        if (count === items.length) return 'all';
        if (count === 0) return 'none';
        return 'some';
    }

    export const becauseNoValues = 'No values.';


    export function chunkHorizontally<T>(values: ReadonlyArray<T>, count: number): T[][] {
        const rows: T[][] = [];
        let row: T[] = [];
        for (const value of values) {
            if (row.length >= count) {
                rows.push(row);
                row = [];
            }
            row.push(value);
        }
        if (row.length > 0) {
            rows.push(row);
        }
        return rows;
    }

    export function chunkVertically<T>(values: ReadonlyArray<T>, count: number): T[][] {
        const rows: T[][] = [];
        let column: T[] = [];
        for (const value of values) {
            if (column.length >= count) {
                rows.push(column);
                column = [];
            }
            column.push(value);
        }
        if (column.length > 0) {
            rows.push(column);
        }
        return rows;
    }

    export function takeAtMost<T>(values: T[], count: number): T[] {
        return values.length >= count
            ? values.slice(0, count)
            : values;
    }

    export function maybeAcrossArrayAlong<T, A>(older: T[], along: A, across: (value: T, along: A) => T): T[] {
        return foldArray(older, older, (result, olderAspect, index) => {
            const newerAspect = across(olderAspect, along);
            if (olderAspect === newerAspect) return result;
            const before = result.slice(0, index);
            const after = result.slice(index + 1);
            return [...before, newerAspect, ...after];
        });
    }

    export interface ForEachful<T> {
        forEach(use: (value: T) => void): void;
    }

    export function hasAnyThatOr<T, Or>(values: T[], isThat: (value: T) => boolean, or: Or): boolean | Or {
        return values.length > 0 ? values.some(isThat) : or;
    }

    export function hasAnyAlikeOr<T, Or>(values: T[], sample: T, areAlike: (one: T, another: T) => boolean, or: Or): boolean | Or {
        return hasAnyThatOr(values, value => areAlike(value, sample), or);
    }

    export function hasAllThatOr<T, Or>(values: T[], isThat: (value: T) => boolean, or: Or): boolean | Or {
        if (values.length <= 0) return or;
        for (let index = 0; index < values.length; index++) { // <-- must be from first to last, because used for boolean operations, where this very order is a must
            if (isThat(values[index])) continue;
            return false;
        }
        return true;
    }
    export function countsOfThatInArray<T, U>(values: T[], of: (value: T) => U, isThat: (value: U) => boolean): number {
        let count = 0;
        for (let index = 0; index < values.length; index++) {
            const value = values[index];
            const that = of(value);
            if (isThat(that)) {
                count += 1;
            }
        }
        return count;
    }

    export function countAllThat<T>(values: T[], isThat: (value: T) => boolean): number {
        let count = 0;
        for (let index = values.length - 1; index >= 0; index--) {
            if (isThat(values[index])) {
                count++;
            }
        }
        return count;
    }

    export function append<T>(result: T[], value: T): T[] {
        result.push(value);
        return result;
    }

    export function firstOr<T, Or>(values: T[], or: Or): T | Or {
        return values.length > 0 ? values[0] : or;
    }

    export function* chop<T>(values: T[], size: number): Generator<T[], void, unknown> {
        while (values.length > 0) {
            const chunk = values.splice(0, size);
            yield chunk;
        }
    }

    export function insteadLastInArrayOr<T, U, O>(values: T[], instead: (value: T) => U, or: O): U | O {
        if (values.length < 1) return or;
        return instead(values[values.length - 1]);
    }

    export function iterate<T>(start: number, step: number, count: number, make: (at: number) => T): T[] {
        const result: T[] = [];
        let i = 0;

        while (i < count) {
            const at = start + step * i;
            const value = make(at);
            result.push(value);
            i += 1;
        }
        return result;
    }
}
export = arrays;
