import { wait } from './promises';
import { isNonNull, isUndefined } from './shared/core';
import { Timestamp, toTimestamp } from './shared/time-stamping';

export type Task<State> = (state: State) => Promise<State>;
export type Job<State> = (state: State) => Task<State>[];
export interface JobController { shouldFinish: boolean; dontWait: () => void; }

export async function willBeWorking<State>(
    state: State,
    willDigest: (state: State) => Promise<void>,
    jobs: Job<State>[],
    controller: JobController,
    refill: (jobs: Job<State>[]) => void,
    delay: number,
): Promise<State> {
    let lastState = state;
    let shouldWait = false;
    let x = 0;
    await willDigest(lastState); // <-- first rerender
    while (true) {
        if (controller.shouldFinish) return lastState;
        let job = jobs.shift();
        if (isUndefined(job)) {
            if (shouldWait) {
                console.log('waiting: ' + (x ++));
                await wait(delay, controller);
            }
            refill(jobs);
            shouldWait = true; // <-- assuming the worse
            job = jobs.shift();
            if (isUndefined(job)) return lastState; // <-- no jobs
        }
        const tasks = job(lastState);
        for (const task of tasks) {
            const newerState = await task(lastState);
            if (newerState === lastState) continue;
            await willDigest(newerState);
            lastState = newerState;
            shouldWait = false; // <-- we had at least one async operation resulting into state change, so no need to add a pause before refilling jobs
        }
    }
}

export function jobIfOver<State>(
    seeIfShouldRun: (state: State) => boolean,
    job: Job<State>,
) {
    return function jobIf(state: State): Task<State>[] {
        const shouldRun = seeIfShouldRun(state);
        return shouldRun
            ? job(state)
            : [];
    };
}

export function jobEveryOver<State>(
    delay: number,
    job: Job<State>,
) {
    let lastRunAt: Timestamp | null = null;
    return function jobEvery(state: State): Task<State>[] {
        if (isNonNull(lastRunAt)) {
            let now = toTimestamp();
            const ago = now - lastRunAt;
            if (ago < delay) return [];
        }
        const steps = job(state);
        lastRunAt = toTimestamp();
        return steps;
    };
}

export function emitJobOver<State, Stuff>(
    willEmit: () => Promise<Stuff>,
    willApply: (state: State, stuff: Stuff) => Promise<State>,
) {
    return function emitJob(_state: State): Task<State>[] {
        async function task(state: State): Promise<State> {
            const stuff = await willEmit();
            state = await willApply(state, stuff);
            return state;
        }
        return [task];
    };
}
export function jobingFor<State>() {
    return {
        task(task: Task<State>) {
            return new JobBuilder<State>(_state => [task]);
        },
        emit<Stuff>(
            willEmit: () => Promise<Stuff>,
            willApply: (state: State, stuff: Stuff) => Promise<State>
        ) {
            return new JobBuilder<State>(emitJobOver(willEmit, willApply));
        }
    };
}
export class JobBuilder<State> {
    constructor(
        public job: Job<State>,
    ) {
    }
    runIf(seeIfShouldRun: (state: State) => boolean) {
        this.job = jobIfOver(seeIfShouldRun, this.job);
        return this;
    }
    runEvery(delay: number) {
        this.job = jobEveryOver(delay, this.job);
        return this;
    }
    alter(alter: (tasks: Task<State>[]) => Task<State>[]) {
        this.job = alterOver(this.job, alter);
        return this;
    }
    overTo<R>(over: (builder: JobBuilder<State>) => R): R {
        return over(this);
    }
}
function alterOver<State>(
    job: Job<State>,
    alter: (tasks: Task<State>[]) => Task<State>[],
): Job<State> {
    return function alterUnder(state: State): Task<State>[] {
        const tasks = job(state);
        return alter(tasks);
    };
}

