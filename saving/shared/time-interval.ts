export interface TimeInterval {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

export function makeTimeIntervalOfMs(ms: number): TimeInterval {
    const milliseconds = ms % 1000;
    ms = (ms - milliseconds) / 1000;
    const seconds = ms % 60;
    ms = (ms - seconds) / 60;
    const minutes = ms % 60;
    ms = (ms - minutes) / 60;
    const hours = ms % 24;
    ms = (ms - hours) / 24;
    const days = ms;
    return { days, hours, minutes, seconds, milliseconds };
}

export function getMsOfTimeInterval(interval: TimeInterval) {
    const { days, hours, minutes, seconds, milliseconds } = interval;
    let internal = 0;
    internal += days * 1000 * 60 * 60 * 24;
    internal += hours * 1000 * 60 * 60;
    internal += minutes * 1000 * 60;
    internal += seconds * 1000;
    internal += milliseconds ;
    return internal;
}

