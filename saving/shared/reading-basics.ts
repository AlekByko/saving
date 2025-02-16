import { fail, isNull } from './core';

declare var console: { log(...args: any[]): void; }

export interface Choked {
    kind: 'choked';
    isBad: true;
    index: number;
}

export function chokedFrom(index: number): Choked {
    return { kind: 'choked', isBad: true, index };
}

export type ParsedOrNot<T> = Choked | Captured<T>;

export interface Captured<T = string> {
    kind: 'captured';
    isBad: false;
    index: number;
    value: T;
}

export function capturedFrom<T>(index: number, value: T): Captured<T> {
    return { kind: 'captured', isBad: false, index, value };
}
export type Read<T> = (text: string, index: number) => Choked | Captured<T>;
export function readLitOver<Liteal extends string>(literal: Liteal) {
    function readLitUnder(text: string, index: number): Choked | Captured<Liteal> {
        return readLit(text, index, literal);
    };
    readLitUnder.debugName = 'lit(' + literal + ')';
    return readLitUnder;
}
export function readLit<Literal extends string>(text: string, index: number, literal: Literal): Choked | Captured<Literal> {
    const part = text.substr(index, literal.length);
    if (part !== literal) return chokedFrom(index);
    return capturedFrom(index + part.length, literal);
}


export function readReg<T>(
    text: string, index: number, regexp: RegExp,
    parse: (matched: RegExpExecArray) => T,
): Choked | Captured<T> {
    // either sticky or global is enough to make lastIndex work:
    // if (!regexp.global) return fail('Regexp has to be global to update the lastIndex./gy: ' + regexp.source);
    if (!regexp.sticky) return fail('Regexp has to be sticky to respect the lastIndex./gy: ' + regexp.source);
    regexp.lastIndex = index;
    const matched = regexp.exec(text);
    if (isNull(matched)) return chokedFrom(index);
    const [all] = matched;
    const parsed = parse(matched);
    return capturedFrom(index + all.length, parsed);
}

export function readInto<Value, Result>(
    read1st: (text: string, index: number) => Choked | Captured<string>,
    read2nd: (text: string, index: number) => Choked | Captured<Value>,
    add: (text: string, value: Value) => Result,
) {
    function readAfter(text: string, index: number): Choked | Captured<Result> {
        const tried1st = read1st(text, index);
        if (tried1st.isBad) return tried1st;
        const tried2nd = read2nd(tried1st.value, 0);
        if (tried2nd.isBad) return chokedFrom(index);
        if (tried2nd.index < tried1st.value.length) return chokedFrom(index);
        const result = add(tried1st.value, tried2nd.value);
        return capturedFrom(tried1st.index, result);
    }
    readAfter.debugName = read1st.toDebugName + '~>' + read2nd.toDebugName();
    return readAfter;
}


export function readRegOver<T>(regexp: RegExp, parse: (matched: RegExpExecArray) => T) {
    function readRegUnder(text: string, index: number): Choked | Captured<T> {
        return readReg(text, index, regexp, parse);
    };
    readRegUnder.debugName = 'reg(' + regexp.source + ')';
    return readRegUnder;
}

export const unparsed = Symbol('unparsed');
export type Unparsed = typeof unparsed;
export function parseOver<T, U>(
    read: (text: string, index: number) => Choked | Captured<T>,
    parse: (value: T) => U | Unparsed,
) {
    function parseUnder(text: string, index: number): Choked | Captured<U> {
        const tried = read(text, index);
        if (tried.isBad) return tried;
        const parsed = parse(tried.value);
        if (parsed === unparsed) return chokedFrom(index);
        return capturedFrom(tried.index, parsed);
    };
    parseUnder.debugName = read.toDebugName() + '->' + parse.toDebugName();
    return parseUnder;
}

export function readOver<Parse, Value>(read: (text: string, index: number, parse: Parse) => Choked | Captured<Value>, parse: Parse) {
    return function readUnder(text: string, index: number): Choked | Captured<Value> {
        return read(text, index, parse);
    };
}

export function secondGoes<T>(_goner: unknown, stayer: T): T {
    return stayer;
}

export function firstGoes<T>(stayer: T, _goner: unknown): T {
    return stayer;
}

export function wholeThing(match: RegExpMatchArray): string {
    const [all] = match;
    return all;
}
wholeThing.debugName = 'whole-thing';

export function diagnose<Actual>(
    read: (text: string, index: number) => Choked | Captured<Actual>,
    text: string, index: number, shouldRun: boolean,
): void {
    if (!shouldRun) return;
    const tried = read(text, index);
    if (tried.isBad) {
        console.log(text);
        console.log(tried);
        console.log(text.substr(tried.index, 10) + '...');
    } else {
        console.log('passed ' + read.toDebugName());
        console.log(tried);
        console.log(text);
    }
}

export type AddProp<Name extends string, Result extends object, Value> = {
    [P in keyof Result | Name]: P extends keyof Result ? Result[P] : Value;
};
export function keepAs<Name extends string, Result extends object, Value>(name: Name) {
    return function keepAs(result: Result, value: Value): { // <-- for better overall readability we are not using a named type alias here
        [P in keyof Result | Name]: P extends keyof Result ? Result[P] : Value;
    } {
        // @ts-ignore
        result[name] = value;
        return result as any;
    };
}

export function alwaysEmptyObject(): {} {
    return {};
}


function expect(actual: unknown, expected: string) {
    if (actual == expected) {
        console.log('passed');
    } else {
        console.log('failed');
        console.log('expected', expected);
        console.log('actual', actual);
    }
}
expect(readLitOver(';').debugName, 'lit(;)');


Function.prototype.toDebugName = function (this: Function) {
    return this.debugName ?? this.name ?? this.toString();
}
declare global {
    interface Function {
        debugName?: string;
        toDebugName(): string;
    }
}

export function compose<T, U, V>(
    inner: (value: T) => U,
    outer: (value: U) => V,
) {
    function composeUnder(value: T): V {
        const middle = inner(value);
        const final = outer(middle);
        return final;
    };
    return composeUnder;
}
