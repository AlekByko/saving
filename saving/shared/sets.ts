import { ForEachful } from './arrays';

export function copySet<T>(values:Set<T>, copy: (value: T) => T): Set<T> {
    const result = new Set<T>();
    values.forEach(value => {
        const copied = copy(value);
        result.add(copied);
    });
    return result;
}

export function toArrayFromSet<T>(values: Set<T>): T[] {
    const result: T[] = [];
    values.forEach(value => {
        result.push(value);
    });
    return result;
}

export function toggleInSet<T>(values: Set<T>, value: T, copy: (values: Set<T>) => Set<T>): Set<T> {
    const copied = copy(values);
    if (copied.has(value)) {
        copied.delete(value);
    } else {
        copied.add(value);
    }
    return copied;
}

export function putAllIntoSet<T>(values: Set<T>, all: ForEachful<T>): void {
    all.forEach(value => {
        values.add(value);
    });
}

export function uniteSets<T>(left: Set<T>, right: Set<T>): Set<T> {
    const result = new Set<T>();
    left.forEach(value => {
        result.add(value);
    });
    right.forEach(value => {
        result.add(value);
    });
    return result;
}

export function subtractSets<T>(left: Set<T>, right: Set<T>): Set<T> {
    const result = new Set<T>();
    left.forEach(value => {
        if (!right.has(value)) {
            result.add(value);
        }
    });
    return result;
}

export function intersectSets<T>(one: Set<T>, another: Set<T>): Set<T> {
    const result = new Set<T>();
    one.forEach(value => {
        if (another.has(value)) {
            result.add(value);
        }
    });
    return result;
}

