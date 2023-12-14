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
