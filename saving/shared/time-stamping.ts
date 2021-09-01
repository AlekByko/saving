import { As } from './core';
import { padZero } from './texting';

export type Timestamp = number & As<'timestamp'>;

export function toTimestamp(): Timestamp {
    return new Date().getTime() as Timestamp;
}

export function formatTimestamp(timestamp: Timestamp): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const result = year + padZero(2, month) + padZero(2, day)
        + '-' + padZero(2, hour) + padZero(2, minute) + padZero(2, second);
    return result;
}



export interface Elapsed {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

export function toElapsed(value: number): Elapsed {
    const milliseconds = value % 1000;
    value = (value - milliseconds) / 1000;

    const seconds = value % 60;
    value = (value - seconds) / 60;

    const minutes = value % 60;
    value = (value - minutes) / 60;

    const hours = value % 24;
    value = (value - hours) / 24;

    const days = value;
    return { milliseconds, seconds, minutes, hours, days };
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
