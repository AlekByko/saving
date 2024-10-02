export function setConsoleTitle(title: string): void {
    const text = String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7);
    process.stdout.write(text);
}

export function wait(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
}

