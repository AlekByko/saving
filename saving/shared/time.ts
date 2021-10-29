export interface ElapsedSeconds {
    hours: number;
    minutes: number;
    seconds: number;
}

export interface ElapsedMiliseconds extends ElapsedSeconds {
    miliseconds: number;
}


export function toElapsedOfMiliseconds(value: number): ElapsedMiliseconds {

    const miliseconds = value % 1000;
    value = (value - miliseconds) / 60;

    const seconds = value % 60;
    value = (value - seconds) / 60;

    const minutes = value % 60;
    value = (value - minutes) / 60;

    const hours = value % 24;
    value = (value - hours) / 24;

    return { miliseconds, seconds, minutes, hours };
}
export function toElapsedOfSeconds(value: number): ElapsedSeconds {

    const seconds = value % 60;
    value = (value - seconds) / 60;

    const minutes = value % 60;
    value = (value - minutes) / 60;

    const hours = value % 24;
    value = (value - hours) / 24;

    return { seconds, minutes, hours };
}

export function pad2(value: number): string {
    return value.toFixed(0).toString().padStart(2, '0');
}
export function formatElapsed({hours, minutes, seconds}: ElapsedSeconds): string {
    return pad2(hours) + ':' + pad2(minutes) + ':' + pad2(seconds);
}
