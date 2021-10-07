import * as cp from 'child_process';

export async function willRunChild(text: string, shouldBeDetached: boolean) {
    const [command, ...args] = text.split(' ');
    return willRunChildExt(command, args, shouldBeDetached);
}

export interface AppRun {
    stderr: string;
    stdout: string;
    code: number | null;
}

export async function willRunChildExt(command: string, args: string[], shouldBeDetached: boolean): Promise<AppRun | null> {
    return new Promise<AppRun | null>(async resolve => {
        console.log(command, args);
        const options: cp.SpawnOptions = {
            detached: shouldBeDetached,
            cwd: process.cwd(),
            shell: shouldBeDetached ? true : false,
            env: process.env,
            windowsHide: true,
            windowsVerbatimArguments: true,
            // below
            // - "pipe": means stdout and stderr are non null, and parent process can listen to them
            // - "inherit": means stdout and stderr are null, and parent process gets all output of the child to its console
            stdio: shouldBeDetached ? undefined : 'pipe',
        };
        // https://nodejs.org/dist./v0.10.44/docs/api/child_process.html#child_process_child_stdio
        const child = cp.spawn(command, args, options);
        if (shouldBeDetached) {
            resolve(null);
        } else {

            child.stdout!.pipe(process.stdout);
            const stdout: string[] = [];
            for await (const chunk of child.stdout!) {
                stdout.push(chunk);
            }

            child.stderr!.pipe(process.stderr);
            const stderr: string[] = [];
            for await(const chunk of child.stderr!) {
                stderr.push(chunk);
            }

            child.on('exit', code => {
                child.stdout!.unpipe(undefined);
                child.stderr!.unpipe(undefined);
                const result: AppRun = {
                    stderr: stderr.join(''),
                    stdout: stdout.join(''),
                    code,
                };
                resolve(result);
            });
        }
    });
}
