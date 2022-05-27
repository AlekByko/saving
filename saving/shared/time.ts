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
export function toElapsedSeconds(value: number): ElapsedSeconds {

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
export function formatElapsedSeconds({hours, minutes, seconds}: ElapsedSeconds): string {
    return pad2(hours) + ':' + pad2(minutes) + ':' + pad2(seconds);
}

export function toFirstDateOfMonth(date: Date): Date {
    const month = date.getMonth();
    const year = date.getFullYear();
    return new Date(year, month, 1);
}

export function toFirstDateOfWeek(date: Date): Date {
    // 0 - sunday
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    const dayOfMonth = date.getDate();
    return new Date(year, month, dayOfMonth - dayOfWeek);
}

export function addDay(date: Date, delta: number): Date {
    const month = date.getMonth();
    const year = date.getFullYear();
    const day = date.getDate();
    return new Date(year, month, day + delta);
}

export function toFirstDateOfNextWeek(date: Date): Date {
    // 0 - sunday
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    const dayOfMonth = date.getDate();
    return new Date(year, month, dayOfMonth + 7 - dayOfWeek);
}

export function toLastDateOfMonth(date: Date): Date {
    const month = date.getMonth();
    const year = date.getFullYear();
    return new Date(year, month + 1, 0); // minus 1 day from beginning of next month
}
