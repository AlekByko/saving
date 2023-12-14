import { padZero, quantify } from './texting';
import { Timestamp } from './time-stamping';

export interface Elapsed {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

export function toElapsed(value: number): Elapsed {
    const milliseconds = value % 1000;
    value = (value - milliseconds) / 1000; // without the remainder it can be divided by 1000 without the remainder... duh!

    const seconds = value % 60;
    value = (value - seconds) / 60;

    const minutes = value % 60;
    value = (value - minutes) / 60;

    const hours = value % 24;
    value = (value - hours) / 24;

    const days = value;
    return { milliseconds, seconds, minutes, hours, days };
}

export function formatElapsedSeconds({ hours, minutes, seconds }: Elapsed): string {
    return padZero(2, hours) + ':' + padZero(2, minutes) + ':' + padZero(2, seconds);
}

export function formatElapsed({ days, hours, minutes }: Elapsed): string {
    if (days > 0) {
        return 'forever';
    } else if (hours > 0) {
        if (minutes > 0) {
            return `${hours} hr ${minutes} m`;
        } else {
            return `${hours} hr`;
        }
    } else if (minutes > 0) {
        return `${minutes} m`;
    } else {
        return 'just now';
    }
}



const knownMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatTimestampAndElapsedDays(timestamp: Timestamp, now: Timestamp): string {
    const elapsed = toElapsed(now - timestamp);
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hour = padZero(2, date.getHours());
    const minute = padZero(2, date.getMinutes());
    const days = quantify(elapsed.days, 'today',  '1 d', `${elapsed.days} d`);
    const mon = knownMonths[month]
    return `${days}, ${mon} ${day}, ${year}, ${hour}:${minute}`;
}
