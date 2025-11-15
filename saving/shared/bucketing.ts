import { foldArray } from "./arrays";
import { fail, isDefined, isNonNull } from './core';
import { toArrayFromSet } from "./sets";

export type Buckets<N, B> = Map<N, B>;

export function insteadBuckets<N, B, P>(buckets: Buckets<N, B>, instead: (bucket: B) => P): Buckets<N, P> {
    const result = new Map<N, P>();
    for (const [key, bucket] of buckets) {
        const other = instead(bucket);
        result.set(key, other);
    }
    return result;
}

export function toBucketsOf<N, B>(groups: N[][], toBucket: () => B): Buckets<N, B> {
    const result = new Map<N, B>();
    const dups = new Set<N>();
    groups.forEach(names => {
        const bucket = toBucket();
        names.forEach(name => {
            if (result.has(name)) {
                dups.add(name);
            } else {
                result.set(name, bucket);
            }
        });
    });
    if (dups.size > 0) {
        return fail('Dups: ' + toArrayFromSet(dups).join(', '));
    }
    return result;
}

export function groupPairedOver<T, N>(
    nameOf: (value: T) => N,
    whenUsed: (value: T, isPaired: boolean) => void,
) {
    return function groupPaired(all: T[], buckets: Buckets<N, T[]>): T[] {
        const chunks: T[][] = [];
        let last = 0;
        for (let index = 0; index < all.length; index++) {
            const at = all[index];
            const name = nameOf(at);
            const bucket = buckets.get(name);
            if (!isDefined(bucket)) {
                whenUsed(at, false);
                continue;
            }
            const chunk = all.slice(last, index);
            chunks.push(chunk);
            if (bucket.length < 1) {
                chunks.push(bucket);
            }
            whenUsed(at, true);
            bucket.push(at);
            last = index + 1;
        }
        chunks.push(all.slice(last));
        const result = foldArray(chunks, [] as T[], (result, chunk) => {
            result.push(...chunk);
            return result;
        });
        return result;
    };

}

export function makeBucketsFromPairs<T>(pairs: T[][]): Buckets<T, Set<T>> {
    const buckets = toBucketsOf<T, Set<T>>(pairs, () => new Set());
    pairs.forEach(pair => {
        pair.forEach(one => {
            buckets.get(one)!.add(one);
        });
    });
    return buckets;
}

export function makePairsFromBuckets<T>(buckets: Buckets<T, Set<T>>): T[][] {
    const almost = Array.from(buckets.values())
        // since the same value can be found at different keys, we need to avoid duplicates:
        .toSet().toArray();
    const pairs = almost.map(toArrayFromSet);
    return pairs;
}

export function rePair<T>(buckets: Buckets<T, Set<T>>, names: T[], isIt: (value: unknown) => value is T): void {

    // either a single name yet to add (if haven't been seen), or all paired names including the name itself if already in a bucket
    const namesAndBuckets = names.map(name => {
        const bucket = buckets.get(name);
        if (isDefined(bucket)) {
            return toArrayFromSet(bucket);
        } else {
            return name;
        }
    });

    // only names never seen before yet to be added
    const coming = namesAndBuckets.filter(isIt);

    // a bucket of used-to-be-pared names that need to re-paired
    const leaving = namesAndBuckets.map(x => isIt(x) ? null : x).filter(isNonNull).flatMap(x => x).toSet();

    leaving.forEach(name => {
        // for each name to be re-paired
        buckets.delete(name); // removing old entry
        buckets.set(name, leaving); // registring the ultimate bucket to keep at every name in this very bucket
    });

    // for all names never seen before yet to be added
    coming.forEach(name => {
        leaving.add(name); // adding a name never seen before name to the ultimate bucket to keep
        buckets.set(name, leaving); // registring the ultimate bucket to keep at every name never seen before
    });
}


export function unPair<T>(buckets: Buckets<T, Set<T>>, names: T[]): void {
    names.forEach(name => {
        const bucket = buckets.get(name);
        if (isDefined(bucket)) {
            bucket.delete(name);
            buckets.delete(name);
        }
    });
}
