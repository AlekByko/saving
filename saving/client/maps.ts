import { isUndefined } from './shared/core';

export function toBucketMapFromArray<T, K, V, B>(
    items: T[],
    toKey: (value: T, index: number) => K,
    toValue: (item: T, key: K, index: number) => V,
    toBucket: (value: V, key: K, item: T, index: number) => B,
    add: (bucket: B, value: V) => B,
): Map<K, B> {
    const result = new Map<K, B>();
    const { length } = items;
    for (let index = 0; index < length; index++) {
        const item = items[index];
        const key = toKey(item, index);
        const value = toValue(item, key, index);
        if (result.has(key)) {
            const olderBucket = result.get(key)!;
            const newerBucket = add(olderBucket, value);
            if (olderBucket !== newerBucket) {
                result.set(key, newerBucket);
            }
        } else {
            const bucket = toBucket(value, key, item, index);
            result.set(key, bucket);
        }
    }
    return result;
}

export function toMapFromArray<T, K, V>(
    items: T[],
    toKey: (value: T, index: number) => K,
    toValue: (item: T, key: K, index: number) => V,
    resolve: (newer: V, older: V, key: K) => V,
): Map<K, V> {
    const result = new Map<K, V>();
    const { length } = items;
    for (let index = 0; index < length; index++) {
        const item = items[index];
        const key = toKey(item, index);
        const value = toValue(item, key, index);
        if (result.has(key)) {
            const olderValue = result.get(key)!;
            if (olderValue !== value) {
                const resolvedValue = resolve(value, olderValue, key);
                result.set(key, resolvedValue);
            }
        } else {
            result.set(key, value);
        }
    }
    return result;
}

export function toMapFromArrayByKeys<T, K, V>(
    items: T[],
    toKeys: (value: T, index: number) => K[],
    toValue: (item: T, key: K, index: number) => V,
    resolve: (newer: V, older: V, key: K) => V,
): Map<K, V> {
    const result = new Map<K, V>();
    const { length } = items;
    for (let index = 0; index < length; index++) {
        const item = items[index];
        const keys = toKeys(item, index);
        for (const key of keys) {
            const value = toValue(item, key, index);
            if (result.has(key)) {
                const olderValue = result.get(key)!;
                if (olderValue !== value) {
                    const resolvedValue = resolve(value, olderValue, key);
                    result.set(key, resolvedValue);
                }
            } else {
                result.set(key, value);
            }
        }
    }
    return result;
}

export function diffMapsViaKeys<K, V>(older: Map<K, V>, newer: Map<K, V>) {
    const staying = new Map<K, V>();
    const coming = new Map<K, V>();
    newer.forEach((value, key) => {
        if (older.has(key)) {
            staying.set(key, value);
        } else {
            coming.set(key, value);
        }
    });
    const leaving = new Map<K, V>();
    older.forEach((value, key) => {
        if (newer.has(key)) {
            staying.set(key, value);
        } else {
            leaving.set(key, value);
        }
    });
    return { leaving, staying, coming };
}

export function atMapOr<K, V, Or>(values: Map<K, V>, key: K, or: Or): V | Or {
    if (!values.has(key)) return or;
    return values.get(key)!;
}

export function atMapInsteadOr<K, V, T, Or>(
    values: Map<K, V>,
    key: K,
    toValue: (value: V) => T,
    or: Or,
): T | Or {
    if (!values.has(key)) return or;
    const found = values.get(key)!;
    const result = toValue(found);
    return result;
}

export function seeIfMapsEqual<K, V>(
    one: Map<K, V>,
    another: Map<K, V>,
    areEqual: (one: V, another: V) => boolean,
): boolean {
    const keys = [...Array.from(one.keys()), ...Array.from(another.keys())].toSet();
    for (const key of keys) {
        if (!one.has(key)) return false;
        if (!another.has(key)) return false;
        if (!areEqual(one.get(key)!, another.get(key)!)) return false;
    }
    return true;
}

export function copyMap<K, V>(values: Map<K, V>, copy: (value: V) => V): Map<K, V> {
    const result = new Map<K, V>();
    for (const [key, value] of values) {
        const copied = copy(value);
        result.set(key, copied);
    }
    return result;
}

export function seeIfHasAnyInMap<K, V>(
    values: Map<K, V>,
    isThat: (value: V, key: K) => boolean
): boolean {
    for (const [key, value] of values) {
        if (isThat(value, key)) return true;
    }
    return false;
}

export function claimInMap<K, V>(
    values: Map<K, V>,
    key: K,
    make: (key: K) => V,
): V {
    const found = values.get(key);
    if (isUndefined(found)) {
        const value = make(key);
        values.set(key, value);
        return value;
    } else {
        return found;
    }
}
