import { fail } from './core';

const zeros = '00000000000000000000000000';
export function padZero(maxDigits: number, value: number): string {
    const text = (~~value).toString();
    return padZeroText(maxDigits, text);
}


export function padZeroText(maxDigits: number, text: string) {
    const zeroCount = maxDigits - text.length;
    return zeros.substr(0, zeroCount) + text;
}

export function stripEndOrFail(text: string, end: string, failure: string): string {
    if (text.substr(text.length - end.length) === end) return text.substring(0, text.length - end.length);
    return fail(failure + `Text "${text}" does not end in "${end}".`);
}

export function quantify(value: number, none: string, singular: string, plural: string): string {
    return value > 0
        ? value === 1 ? singular : plural
        : none;
}

declare const EmptyString: unique symbol;
export type EmptyString = typeof EmptyString;

export function splitIntoNonBlankLines(text: string): string[] {
    return text.split('\n').map(x => x.trim()).filter(x => x.length > 0);
}
