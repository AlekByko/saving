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
