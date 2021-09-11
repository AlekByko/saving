
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

export function not(isIt: boolean): boolean {
    return !isIt;
}
export type Copy<T> = (value: T) => T;

export function same<T>(value: T): T {
    return value;
}

export declare class As<S extends string> {
    private as: S;
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
    return isUndefined(one)
        ? isUndefined(another)
            ? 0
            : -1
        : isUndefined(another)
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
    }
    interface Set<T> {
        toArray(): T[];
    }
}
Array.prototype.toSet = function <T>(this: Array<T>) {
    return new Set(this);
}
Set.prototype.toArray = function <T>(this: Set<T>) {
    return Array.from(this);
}
export function toArray() {
    return [];
}
