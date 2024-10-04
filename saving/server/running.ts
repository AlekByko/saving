
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import * as fs from 'fs';
import { PassThrough } from 'stream';
import { fix, isDefined, isNull } from './shared/core';


export type AppRun = NoCodeAppRun | CodedAppRun | ErroredAppRun;
export interface NoCodeAppRun {
    stderr: string;
    stdout: string;
    kind: 'no-code-app-run';
}
export interface CodedAppRun {
    kind: 'coded-app-run';
    stderr: string;
    stdout: string;
    code: number;
}

export interface ErroredAppRun {
    kind: 'errored-app-run';
    stderr: string;
    stdout: string;
    error: Error;
}

export interface RunChild { child: ChildProcess; onceDone: Promise<AppRun> }
export function runChildDetached(text: string): ChildProcess {
    const [command, ...args] = text.split(' ');
    console.log(command, args);
    const options: SpawnOptions = {
        detached: true,
        cwd: process.cwd(),
        shell: true,
        env: process.env,
        windowsHide: true,
        windowsVerbatimArguments: true,
        stdio: undefined,
    };
    // https://nodejs.org/dist./v0.10.44/docs/api/child_process.html#child_process_child_stdio
    const child = spawn(command, args, options);
    return child;
}


export function willRunChildAttachedExt(
    text: string,
    shouldWriteToConsole: boolean,
    whenChunk: (chunk: Buffer) => void,
): RunChild {
    const [command, ...args] = text.split(' ');
    console.log(command, args);
    const options: SpawnOptions = {
        detached: false,
        cwd: process.cwd(),
        shell: false,
        env: process.env,
        windowsHide: true,
        windowsVerbatimArguments: true,
        // below
        // - "pipe": means stdout and stderr are non null, and parent process can listen to them
        // - "inherit": means stdout and stderr are null, and parent process gets all output of the child to its console
        stdio: 'pipe',
    };
    // https://nodejs.org/dist./v0.10.44/docs/api/child_process.html#child_process_child_stdio
    const child = spawn(command, args, options);
    const onceDone = new Promise<AppRun>(async resolve => {
        if (shouldWriteToConsole) {
            child.stdout!.pipe(process.stdout);
            child.stderr!.pipe(process.stderr);
        }

        const stdout: string[] = [];
        for await (const chunk of child.stdout!) {
            whenChunk(chunk);
            stdout.push(chunk);
        }

        const stderr: string[] = [];
        for await (const chunk of child.stderr!) {
            whenChunk(chunk);
            stderr.push(chunk);
        }
        child.on('disconnect', () => {
            if (shouldWriteToConsole) {
                child.stdout!.unpipe(undefined);
                child.stderr!.unpipe(undefined);
            }
            const result: NoCodeAppRun = {
                kind: 'no-code-app-run',
                stderr: stderr.join(''),
                stdout: stdout.join(''),
            };
            resolve(result);
        });
        child.on('error', error => {
            if (shouldWriteToConsole) {
                child.stdout!.unpipe(undefined);
                child.stderr!.unpipe(undefined);
            }
            const result: ErroredAppRun = {
                kind: 'errored-app-run',
                stderr: stderr.join(''),
                stdout: stdout.join(''),
                error,
            };
            resolve(result);
        });
        child.on('exit', code => {
            if (shouldWriteToConsole) {
                child.stdout!.unpipe(undefined);
                child.stderr!.unpipe(undefined);
            }
            if (isNull(code)) {
                const result: NoCodeAppRun = {
                    kind: 'no-code-app-run',
                    stderr: stderr.join(''),
                    stdout: stdout.join(''),
                };
                resolve(result);
            } else {
                const result: CodedAppRun = {
                    kind: 'coded-app-run',
                    stderr: stderr.join(''),
                    stdout: stdout.join(''),
                    code,
                };
                resolve(result);
            }
        });
    });
    return { child, onceDone };
}


export function willRunChildAttached(text: string): Promise<number | null> {
    const [command, ...args] = text.split(' ');
    return willRunChildAttachedExt1(command, args);
}
export function willRunChildAttachedExt1(command: string, args: string[]): Promise<number | null> {

    console.log(command, args);
    const options: SpawnOptions = {
        detached: false,
        cwd: process.cwd(),
        shell: false,
        env: process.env,
        windowsHide: true,
        windowsVerbatimArguments: true,
        // below
        // - "pipe": means stdout and stderr are non null, and parent process can listen to them
        // - "inherit": means stdout and stderr are null, and parent process gets all output of the child to its console
        stdio: 'inherit',
    };
    // https://nodejs.org/dist./v0.10.44/docs/api/child_process.html#child_process_child_stdio
    const child = spawn(command, args, options);
    return new Promise<number | null>(async resolve => {
        child.on('exit', code => {
            resolve(code);
        });

    });
}
export function willRunChildAttachedAndLogFile(
    command: string,
    args: string[],
    logPath: string,
) {

    console.log(command, args);
    const options: SpawnOptions = {
        detached: false,
        cwd: process.cwd(),
        shell: false,
        env: process.env,
        windowsHide: true,
        windowsVerbatimArguments: true,
        // below
        // - "pipe": means stdout and stderr are non null, and parent process can listen to them
        // - "inherit": means stdout and stderr are null, and parent process gets all output of the child to its console
        stdio: ['inherit', 'pipe', 'pipe'],
    };
    const logFile = fs.createWriteStream(logPath);
    // https://nodejs.org/dist./v0.10.44/docs/api/child_process.html#child_process_child_stdio
    const child = spawn(command, args, options);

    class StdoutPassThrough extends PassThrough { }
    class StderrPassThrough extends PassThrough { }

    const stdoutPassThrough = new StdoutPassThrough();
    child.stdout!.pipe(stdoutPassThrough);
    stdoutPassThrough.pipe(process.stdout);
    stdoutPassThrough.pipe(logFile);
    stdoutPassThrough.on('error', e => {
        console.log('Error in child stdout.', e);
        disconnect('Error in stdout path through.');
    });

    logFile.on('close', (e: any) => {
        console.log('Log file closed.');
        console.log(e);
        console.trace();
        disconnect('Log file closed.');
    });
    logFile.on('error', e => {
        console.log('Log file errored.');
        console.log(e);
        console.trace();
        disconnect('Log file errored.');
    });

    const stderrPassThrough = new StderrPassThrough();
    child.stderr!.pipe(stderrPassThrough)
    stderrPassThrough.pipe(process.stderr);
    stderrPassThrough.pipe(logFile);
    stderrPassThrough.on('error', e => {
        console.log('Error in child stderr.', e);
        disconnect('Error in stderr-pass-though.');
    });

    function disconnect(reason: string) {
        console.log('Unpiping: ' + reason);
        child.stdout!.unpipe(stdoutPassThrough);
        stdoutPassThrough.unpipe(process.stdout);
        stdoutPassThrough.unpipe(logFile);

        child.stderr!.unpipe(stderrPassThrough)
        stderrPassThrough.unpipe(process.stderr);
        stderrPassThrough.unpipe(logFile);
        logFile.end();
        // logFile.close(); // <- abrupt closing no flushing
    }

    return new Promise<{ kind: 'error', e: any } | { kind: 'exit', code: number | null, signal: NodeJS.Signals | null }>(resolve => {
        child.on('close', _e => {
            disconnect('Child closed.');
            if (isDefined(lastE)) {
                resolve(fix({ kind: 'error', e: lastE }));
            } else {
                resolve(fix({ kind: 'exit', code: lastCode, signal: lastSignal }));
            }
        });


        let lastE: Error | undefined = undefined;
        child.on('error', e => { // <-- exit may or may not follow error
            // this is not the final event
            // close event is the last event when all stdio is closed
            lastE = e;
            disconnect('Child errored.');
        });
        let lastCode: number | null = null;
        let lastSignal: NodeJS.Signals | null = null;
        child.on('exit', (code, signal) => {
            // this is not the final event
            // close event is the last event when all stdio is closed
            lastCode = code;
            lastSignal = signal;
            disconnect('Child exited.');
        });
    });
}

export function setoffKillingProcess(pid: number): void {
    // https://stackoverflow.com/questions/23706055/why-can-i-not-kill-my-child-process-in-nodejs-on-windows
    // this is the only way to kill a process under windows, because nodejs sucks
    spawn("taskkill", ["/pid", pid.toString(), '/f', '/t']);
}

export function willKillProcess(pid: number): Promise<void> {
    // https://stackoverflow.com/questions/23706055/why-can-i-not-kill-my-child-process-in-nodejs-on-windows
    // this is the only way to kill a process under windows, because nodejs sucks
    const child = spawn("taskkill", ["/pid", pid.toString(), '/f', '/t']);
    return new Promise<void>((resolve, reject) => {
        child.once('exit', resolve);
        child.once('error', reject);
    });
}
