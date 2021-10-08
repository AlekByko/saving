
import { ChildProcess, spawn, SpawnOptions } from 'child_process';


export interface AppRun {
    stderr: string;
    stdout: string;
    code: number | null;
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

        child.on('exit', code => {
            if (shouldWriteToConsole) {
                child.stdout!.unpipe(undefined);
                child.stderr!.unpipe(undefined);
            }
            const result: AppRun = {
                stderr: stderr.join(''),
                stdout: stdout.join(''),
                code,
            };
            resolve(result);
        });
    });
    return { child, onceDone };
}


export function willRunChildAttached(text: string): Promise<number | null> {
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
