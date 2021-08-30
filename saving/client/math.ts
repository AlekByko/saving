import { fail } from './shared/core';

export function toBaseN(value: number, alphabet: string[], padding: number): string {
    const base = alphabet.length;
    const digits: string[] = [];
    while (true) {
        const low = value % base;
        const high = (value - low) / base;
        digits.push(alphabet[low]);
        if (high > base) {
            value = high;
        } else {
            digits.push(alphabet[high]);
            digits.reverse();
            const text = digits.join('');
            const result = text.padStart(padding, alphabet[0]);
            return result;
        }
    }

}

/** Converts a value in a given base representation into a decimal (base-10). */
export function toBase10(text: string, alphabet: string[]): number {
    const letters = text.split('').reverse();
    const base = alphabet.length;
    let result = 0;
    let baseSoFar = 1;
    letters.forEach(letter => {
        const indexedValue = alphabet.indexOf(letter);
        if (indexedValue < 0) throw fail('There is no numerical value for the letter \'' + letter + '\'.');
        const increment = baseSoFar * indexedValue;
        baseSoFar = baseSoFar * base;
        result += increment;
    });
    return result;
}
