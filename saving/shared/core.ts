
export function isFalse<T extends ([false] extends [T] ? any : never)>(value: T): value is T & false {
    return value === false;
}

export type LikeNull<T> = [null] extends [T] ? any : never;
export function isNull<T extends LikeNull<T>>(value: T): value is T & null {
    return value === null;
}
export function isNonNull<T extends LikeNull<T>>(value: T): value is Exclude<T, null> {
    return value !== null;
}
export function asNonNullOr<T extends LikeNull<T>, Or>(value: T, or: Or): Or | Exclude<T, null> {
    return value === null ? or : value;
}
export function insteadNonNullOr<T extends LikeNull<T>, U, Or>(value: T, instead: (value: Exclude<T, null>) => U, or: Or): U | Or {
    return value === null ? or : instead(value as Exclude<T, null>);
}

export function alwaysNull(): null { return null; }

export function alwaysTrue(): true { return true; }
export function alwaysFalse(): false { return false; }

export type LikeUndefined<T> = undefined extends T ? any : never;
export function asDefinedOr<T extends LikeUndefined<T>, Or>(value: T, or: Or): Or | Exclude<T, undefined> {
    return value === undefined ? or : value;
}
export function asDefinedOrOtherwise<T extends LikeUndefined<T>, W, Or>(value: T, or: Or, otherwise: (or: Or) => W): W | Exclude<T, undefined> {
    return value === undefined ? otherwise(or) : value;
}
export function insteadDefinedOr<T extends LikeUndefined<T>, U, Or>(value: T, instead: (value: Exclude<T, undefined>) => U, or: Or): U | Or {
    return value === undefined ? or : instead(value as Exclude<T, undefined>);
}
export type LikeNonNullable<T> = [undefined] extends [T] ? [null] extends [T] ? any : never : never;
export function asNonNullableOr<T extends LikeNonNullable<T>, Or>(value: T, or: Or): Or | Exclude<T, undefined | null> {
    return value != null ? value : or;
}

export function insteadNonNullableOr<T extends LikeNonNullable<T>, U, Or>(
    value: T,
    instead: (value: Exclude<T, undefined | null>) => U,
    or: Or,
): U | Or {
    return value != null ? instead(value as any) : or;
}
export function isNullable<T extends ([undefined] extends [T] ? any : [null] extends [T] ? any : never)>(value: T): value is T & (undefined | null) {
    return value === undefined || value === null;
}
export function isUndefined<T extends ([undefined] extends [T] ? any : never)>(value: T): value is T & undefined {
    return value === undefined;
}
export function isDefined<T extends LikeUndefined<T>>(value: T): value is Exclude<T, undefined> {
    return value !== undefined;
}
export function alwaysUndefined(): undefined { return undefined; }

export function fail(message: string): never {
    debugger;
    throw new Error(message);
}

export function asFiniteOr<Or>(value: number, or: Or): number | Or {
    return isFinite(value) ? value : or;
}
export function maxOf2(left: number, right: number): number {
    return left > right ? left : right;
}
export function maxOf4(one: number, two: number, three: number, four: number): number {
    return maxOf2(maxOf2(one, two), maxOf2(three, four));
}
export function minOf2(left: number, right: number): number {
    return left < right ? left : right;
}
export function broke(never: never): never {
    console.log(never);
    return fail('This cannot be.');
}
export function brokeBecause(never: never, reason: string): never {
    console.log(never);
    return fail('This cannot be. ' + reason);
}
export function to<T>(value: T): T { return value; }
export type AreEqual<T> = (one: T, another: T) => boolean;

export function ignore(): void { }

export function swallow(value: unknown): void {
    console.log(value);
}

export function areNumbersEqual<N extends number>(one: N, another: N): boolean {
    return one === another;
}

export function areStringsEqual<S extends string>(one: S, another: S): boolean {
    return one === another;
}
export function areStringsDifferent<S extends string>(one: S, another: S): boolean {
    return one !== another;
}

export function not(isIt: boolean): boolean {
    return !isIt;
}
export type Copy<T> = (value: T) => T;

export function same<T>(value: T): T {
    return value;
}

export type Compare<T> = (one: T, another: T) => number;
export function compareRandom(): number {
    return Math.random() - 0.5;
}
export function compareStrings(one: string, another: string): number {
    return one > another ? 1 : another > one ? -1 : 0;
}
export function compareNumbers<N extends number>(one: N, another: N): number {
    return one - another;
}

export function compareUndefinables<T extends LikeUndefined<T>>(
    one: T, another: T, compare: Compare<Exclude<T, undefined>>,
): number {
    return isUndefined(one)
        ? isUndefined(another)
            ? 0
            : -1
        : isUndefined(another)
            ? 1
            : compare(one, another);
}

export function compareNullables<T extends LikeNull<T>>(
    one: T, another: T, compare: Compare<Exclude<T, null>>,
): number {
    return isNull(one)
        ? isNull(another)
            ? 0
            : -1
        : isNull(another)
            ? 1
            : compare(one, another);
}


export type AboutAllBut<Concern extends { about: string }, About extends Concern['about']> = Concern extends { about: About } ? never : Concern;

export function otherwise<T>(_: never, otherwise: T): T {
    return otherwise;
}

export function flipOver<T, U, R>(fn: (one: T, another: U) => R) {
    return function (one: U, another: T): R {
        return fn(another, one);
    };
}

export function notOver<T>(seeIf: (value: T) => boolean) {
    return function not(value: T): boolean {
        return !seeIf(value);
    }
}

export function increment(value: number): number {
    return value + 1;
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}
export function isObject<T extends object>(value: unknown): value is T {
    return typeof value === 'object';
}

declare global {
    interface Array<T> {
        toSet(): Set<T>;
        toMap<K, V>(keyOf: (value: T) => K, valueOf: (value: T) => V, resolve: (newer: V, older: V, key: K) => V): Map<K, V>;
        toSetInstead<U>(instead: (value: T) => U): Set<U>;
        sortOf<V>(copy: (values: T[]) => T[], of: (value: T) => V, compare: (one: V, another: V) => number): T[];
    }
    interface Set<T> {
        toArray(): T[];
    }
    interface Map<K, V> {
        toValues(): V[];
    }
}
Array.prototype.toSet = function <T>(this: Array<T>) {
    return new Set(this);
}
Array.prototype.toMap = function <T, K, V>(this: Array<T>, keyOf: (value: T) => K, valueOf: (value: T) => V, resolve: (newer: V, older: V, key: K) => V) {
    const result = new Map<K, V>();
    for (let index = 0; index < this.length; index ++) {
        const item = this[index];
        const key = keyOf(item);
        const value = valueOf(item);
        if (result.has(key)) {
            const older = result.get(key)!;
            const resolved = resolve(value, older, key);
            if (resolved === older) continue;
            result.set(key, resolved);
        } else {
            result.set(key, value);
        }

    }
    return result;
}
Array.prototype.toSetInstead = function <T, U>(this: Array<T>, instead: (value: T) => U): Set<U> {
    const result = new Set<U>();
    for (let index = 0; index < this.length; index++) {
        result.add(instead(this[index]));
    }
    return result;
}
Array.prototype.sortOf = function <T, V>(
    this: T[],
    copy: (values: T[]) => T[],
    of: (value: T) => V,
    compare: (one: V, another: V) => number,
): T[] {
    const copied = copy(this);
    const compareOf = function (one: T, another: T): number {
        const left = of(one);
        const right = of(another);
        const compared = compare(left, right);
        return compared;
    };
    copied.sort(compareOf);
    return copied;
}
Set.prototype.toArray = function <T>(this: Set<T>) {
    return Array.from(this);
}
Map.prototype.toValues = function <K, V>(this: Map<K, V>) {
    return Array.from(this.values());
}
export function toArray() {
    return [];
}

export function seeIfArraysDifferent<T>(
    ones: T[],
    anothers: T[],
    seeIfDifferent: (one: T, another: T) => boolean,
): boolean {
    if (ones.length !== anothers.length) return true;
    for (let index = 0; index < ones.length; index++) {
        const one = ones[index];
        const another = anothers[index];
        const areDifferent = seeIfDifferent(one, another);
        if (areDifferent) return true;
    }
    return false;
}

export const emptySet: Set<never> = {
    // @ts-ignore
    add() { },
    clear() { },
    // @ts-ignore
    delete() { },
    // @ts-ignore
    entries() { },
    forEach() { },
    has() { return false; },
    // @ts-ignore
    keys() { },
    // @ts-ignore
    size() { },
    // @ts-ignore
    toArray() { },
    // @ts-ignore
    values() { }
}


/**
 * Performs a binary search, finding the index at which an object with `key` occurs in `array`.
 * If no such index is found, returns the 2's-complement of first index at which
 * `array[index]` exceeds `key`.
 */
export function binarySearch<T, U>(
    array: T[],
    key: U,
    keyOf: (v: T, i: number) => U,
    compareKeys: Compare<U>,
    low: number,
): number {

    let high = array.length - 1;
    while (low <= high) {
        const middle = low + ((high - low) >> 1);
        const midKey = keyOf(array[middle], middle);
        const compared = compareKeys(midKey, key);
        if (compared < 0) {
            low = middle + 1;
            continue;
        }
        if (compared > 0) {
            high = middle - 1;
            continue;
        }
        return middle;
    }
    return ~low;
}

export function why(message: string): undefined {
    console.log(message);
    return undefined;
}
export type Because = <R>(message: string, also: unknown, result: R) => R;
export function because<R>(message: string, also: unknown, result: R): R {
    console.log(message);
    console.log(also);
    return result;
}

export type OneOrFew<T> = T | T[];

export type Sign = -1 | 1;
export const defaultSign = 1;
export function flipSign(sign: Sign): Sign {
    switch (sign) {
        case 1: return -1;
        case -1: return 1;
        default: return broke(sign);
    }
}
export function areNotSame<T, U extends T>(one: T, another: U): boolean {
    return one !== another;
}

export function keepScheduling(act: () => void, delay: number): void {
    function schedule() {
        act();
        setTimeout(schedule, delay);
    }
    setTimeout(schedule, delay);
}

export function seeIfObjectsSame<T extends object, U extends T>(one: T, another: U): boolean {
    return one === another;
}


interface Deferred<T> {
    resolve: (value: T) => void;
    reject: (error: any) => void;
    once: Promise<T>;
}
export function toDeferredOf<T>(): Deferred<T> {
    const result = {} as Deferred<T>;

    result.once = new Promise<T>((resolve, reject) => {
        result.reject = reject;
        result.resolve = resolve;
    });

    return result;
}

declare global {
    interface Object {
        realKeys<T extends object>(obj: T): (keyof T)[];
    }
}
Object.realKeys = Object.keys as any;
