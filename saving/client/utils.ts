import { toMapFromArray } from './maps';
import { same } from './shared/core';

export function mergeInto<T>(olderAll: T[], toKey: (value: T) => string, newerFew: T[]): T[] {
    const newerByKey = toMapFromArray(newerFew, toKey, same, same);
    const newerAll = olderAll.map(x => {
        const key = toKey(x);
        if (newerByKey.has(key)) {
            return newerByKey.get(key)!;
        } else {
            return x;
        }
    });
    return newerAll;
}
