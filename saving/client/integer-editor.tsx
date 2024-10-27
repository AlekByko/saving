import { thusParsableEditor } from './parsable-editor';

export const IntegerEditor = thusParsableEditor<number, number, string>({
    format: value => value.toFixed(0),
    parse: text => {
        const parsed = parseInt(text, 10);
        if (!isFinite(parsed)) return 'Bad number: ' + text;
        return parsed;
    },
    parsedValueOf: value => value,
    seeIfParsed: (value): value is number => { return typeof value === 'number'; },
});
