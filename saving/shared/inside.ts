type Of = (some: unknown) => unknown;
type On = (some: unknown, value: unknown) => unknown;
type Atop = (some: unknown, value: unknown) => unknown;
type Across = (some: unknown, across: (value: unknown) => unknown) => unknown;
type Muatate = (some: unknown, value: unknown) => void;

export const $of = Symbol('of');
export const $on = Symbol('on');
export const $atop = Symbol('atop');
export const $across = Symbol('across');
export const $assign = Symbol('assign');
export const $where = Symbol('where');

interface Core {
    [$of]: Of;
    [$on]: On;
    [$atop]: Atop;
    [$across]: Across;
    [$assign]: Muatate;
    [$where]: () => string;
    [key: string]: Core | undefined;
}

function ofOver(key: string): Of {
    return function (x: any) { return x[key]; }
}

function onOver(key: string): On {
    return function (x: any, y: any) { return { ...x, [key]: y }; }
}

export type By<T, U> = {
    [$of]: (obj: T) => U;
    [$on]: (obj: T, value: U) => T;
    [$atop]: <K extends keyof U>(obj: T, part: Pick<U extends object ? U : never, K>) => T;
    [$across]: (obj: T, across: (value: U) => U) => T;
    [$assign]: (obj: T, value: U) => void;
    [$where]: () => string;
} & {
    [P in keyof U]: By<T, U[P]>;
};

const theOnlyStewardYouEverNeed = toBlankSteward({
    [$of]: x => x,
    [$on]: (_x, y) => y,
    [$atop]: (x, y) => ({ ...x as {}, ...y as {} }),
    [$across]: (x, across) => across(x),
    [$assign]: (_x, y) => y,
    [$where]: () => '/',
});

function toBlankSteward(boss: Core): Core {
    return new Proxy(boss, {
        get: (boss: Core, key: string) => {
            let intern = boss[key];
            if (intern !== undefined) return intern;


            const dataOf = boss[$of];
            const dataOn = boss[$on];
            const valueOf = ofOver(key);
            const valueOn = onOver(key);
            intern = toBlankSteward({
                [$where]: () => boss[$where] + '/' + key,
                [$of]: obj => valueOf(dataOf(obj)),
                [$on]: (obj, value) => dataOn(obj, valueOn(dataOf(obj), value)),
                [$atop]: (obj, part) => dataOn(obj, valueOn(dataOf(obj), { ...valueOf(dataOf(obj)) as {}, ...part as {} })),
                [$across]: (olderTop, across) => {
                    const olderMid = dataOf(olderTop);
                    const olderBot = valueOf(olderMid);
                    const newerBot = across(olderBot);
                    if (olderBot === newerBot) {
                        return olderTop;
                    } else {
                        const newerMid = valueOn(olderMid, newerBot);
                        const newerTop = dataOn(olderTop, newerMid);
                        return newerTop;
                    }
                },
                [$assign]: (obj, value) => {
                    // @ts-expect-error
                    dataOf(obj)[key] = value;
                }
            });
            boss[key] = intern;
            return intern;
        },
    });
}

export function inside<T>(): By<T, T> {
    return theOnlyStewardYouEverNeed as any;
}


