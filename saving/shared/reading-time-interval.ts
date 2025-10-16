import { atFirst, capturedFrom, chokedFrom, readReg } from './reading-basics';
import { TimeInterval } from './time-interval';

interface TimeInternalRead {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
}
export function readTimeInternal(
    text: string, startIndex: number,
) {
    if (startIndex >= text.length) return chokedFrom(startIndex, 'EOL');
    let index = startIndex;
    const daysRead = readReg(text, index, /\s*(\d+)d/y, atFirst);
    let hasAnything = false;
    const result: TimeInternalRead = {};
    if (!daysRead.isBad) {
        hasAnything = true;
        index = daysRead.nextIndex;
        const days = parseInt(daysRead.value, 10);
        result.days = days;
    }
    const hoursRead = readReg(text, index, /\s*(\d+)h/y, atFirst);
    if (!hoursRead.isBad) {
        hasAnything = true;
        index = hoursRead.nextIndex;
        const hours = parseInt(hoursRead.value, 10);
        result.hours = hours;
    }
    const minutesRead = readReg(text, index, /\s*(\d+)m/y, atFirst);
    if (!minutesRead.isBad) {
        hasAnything = true;
        index = minutesRead.nextIndex;
        const minutes = parseInt(minutesRead.value, 10);
        result.minutes = minutes;
    }
    const secondsRead = readReg(text, index, /\s*(\d+)s/y, atFirst);
    if (!secondsRead.isBad) {
        hasAnything = true;
        index = secondsRead.nextIndex;
        const seconds = parseInt(secondsRead.value, 10);
        result.seconds = seconds;
    }
    const millisecondsRead = readReg(text, index, /\s*(\d+)ms/y, atFirst);
    if (!millisecondsRead.isBad) {
        hasAnything = true;
        index = millisecondsRead.nextIndex;
        const milliseconds = parseInt(millisecondsRead.value, 10);
        result.milliseconds = milliseconds;
    }
    if (hasAnything) {
        return capturedFrom(index, result);
    } else {
        return chokedFrom(startIndex);
    }
}

export function withTimeInternalRead<R, E>(
    result: R,
    text: string,
    haveDays: (result: R, days: number) => R,
    haveHours: (result: R, hours: number) => R,
    haveMinutes: (result: R, minutes: number) => R,
    haveSeconds: (result: R, seconds: number) => R,
    haveMilliseconds: (result: R, milliseconds: number) => R,
    haveError: (reason: string, text: string) => E
): R | E {
    let index = 0;
    let hadAnything = false;
    const daysRead = readReg(text, index, /\s*(\d+)d/y, atFirst);
    if (!daysRead.isBad) {
        hadAnything = true;
        index = daysRead.nextIndex;
        const days = parseInt(daysRead.value, 10);
        result = haveDays(result, days);
    }
    const hoursRead = readReg(text, index, /\s*(\d+)h/y, atFirst);
    if (!hoursRead.isBad) {
        hadAnything = true;
        index = hoursRead.nextIndex;
        const hours = parseInt(hoursRead.value, 10);
        result = haveHours(result, hours);
    }
    const minutesRead = readReg(text, index, /\s*(\d+)m/y, atFirst);
    if (!minutesRead.isBad) {
        hadAnything = true;
        index = minutesRead.nextIndex;
        const minutes = parseInt(minutesRead.value, 10);
        result = haveMinutes(result, minutes);
    }
    const secondsRead = readReg(text, index, /\s*(\d+)s/y, atFirst);
    if (!secondsRead.isBad) {
        hadAnything = true;
        index = secondsRead.nextIndex;
        const seconds = parseInt(secondsRead.value, 10);
        result = haveSeconds(result, seconds);
    }
    const millisecondsRead = readReg(text, index, /\s*(\d+)ms/y, atFirst);
    if (!millisecondsRead.isBad) {
        hadAnything = true;
        index = millisecondsRead.nextIndex;
        const milliseconds = parseInt(millisecondsRead.value, 10);
        result = haveMilliseconds(result, milliseconds);
    }

    if (hadAnything) return result;

    return haveError('Bad time internval.', text);
}
export function parseTimeInternalOr<Or>(text: string, or: (reason: string) => Or) {
    const newLocal: TimeInterval = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
    };
    const read = withTimeInternalRead(newLocal, text,
        (read, days) => (read.days = days, read),
        (read, hours) => (read.hours = hours, read),
        (read, minutes) => (read.minutes = minutes, read),
        (read, seconds) => (read.seconds = seconds, read),
        (read, milliseconds) => (read.milliseconds = milliseconds, read),
        (reason) => (or(reason), null),
    );
    return read;
}


