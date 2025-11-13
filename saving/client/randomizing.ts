export function startRandomOver(seed: number) {
    return function rand() {
        seed = prng(seed);
        return seed;
    };
}

function prng(n: number) {
    n = n >>> 0;
    n = (n ^ 61) ^ (n >>> 16);
    n = n + (n << 3);
    n = n ^ (n >>> 4);
    n = n * 0x27d4eb2d;
    n = n ^ (n >>> 15);
    return (n >>> 0);
}

export class Random {
    constructor(
        private seed: number,
    ) {
    }

    next(): number {
        return this.seed = prng(this.seed);
    }

    pick<T>(values: T[]): T {
        const next = this.next();
        const at = next % values.length;
        return values[at];
    }
}


export function makeSeed() {
    const a = Math.random() * 0x200000; // upper 21 bits
    const b = Math.random() * 0x100000000; // lower 32 bits
    return ((a | 0) * 0x100000000) + (b >>> 0);
}
