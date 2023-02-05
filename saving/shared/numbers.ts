import { fail } from './core';

export function safeRound(olderFavors: number, delta: number, magnitude: number) {
    return Math.round((olderFavors + delta) * magnitude) / magnitude;
}

export function nextAtAround<T>(values: T[], at: number, delta: number): number {
    const { length } = values;
    if (length < 1) return fail(nextAtAround.name + ': empty array');
    if (length < delta) return fail(nextAtAround.name + ': delta bigger than length');
    return (length + length + at + delta) % length;
}
