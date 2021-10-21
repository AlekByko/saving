import { wait } from './promises';
import { isNonNull, isUndefined } from './shared/core';
import { Timestamp, toTimestamp } from './shared/time-stamping';

export type Task<State> = (state: State) => Promise<State>;
export type Job<State> = (state: State) => Task<State>[];
export interface JobController { shouldFinish: boolean; }
export async function willBeWorking<State>(
    state: State,
    willDigest: (state: State) => Promise<void>,
    jobs: Job<State>[],
    controller: JobController,
    refill: (jobs: Job<State>[]) => void,
): Promise<State> {
    let lastState = state;
    let shouldWait = false;
    while (true) {
        if (shouldWait) await wait(100);
        if (controller.shouldFinish) return lastState;
        let job = jobs.shift();
        if (isUndefined(job)) {
            shouldWait = true;
            refill(jobs);
            job = jobs.shift();
            if (isUndefined(job)) return lastState; // <-- no jobs
        }
        const tasks = job(lastState);
        for (const task of tasks) {
            const newerState = await task(lastState);
            if (newerState === lastState) continue;
            await willDigest(newerState);
            lastState = newerState;
            shouldWait = false;
        }
    }
}

export function stepsIfOver<State>(
    seeIfShouldRun: (state: State) => boolean,
    job: Job<State>,
) {
    return function stepsIf(state: State): Task<State>[] {
        const shouldRun = seeIfShouldRun(state);
        return shouldRun
            ? job(state)
            : [];
    };
}

export function stepsEveryOver<State>(
    delay: number,
    job: Job<State>,
) {
    let lastRunAt: Timestamp | null = null;
    return function stepsEvery(state: State): Task<State>[] {
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

export function willRunEmitApplyOver<State, Stuff>(
    willEmit: () => Promise<Stuff>,
    willApply: (state: State, stuff: Stuff) => Promise<State>,
) {
    return function willRunEmitApply(_state: State): Task<State>[] {
        async function task(state: State): Promise<State> {
            const stuff = await willEmit();
            state = await willApply(state, stuff);
            return state;
        }
        return [task];
    };
}
export function jobFor<State>() {
    return {
        task(task: Task<State>) {
            return new JobBuilder<State>(_state => [task]);
        },
        emit<Stuff>(
            willEmit: () => Promise<Stuff>,
            willApply: (state: State, stuff: Stuff) => Promise<State>
        ) {
            return new JobBuilder<State>(willRunEmitApplyOver(willEmit, willApply));
        }
    };
}
export class JobBuilder<State> {
    constructor(
        public job: Job<State>,
    ) {
    }
    runIf(seeIfShouldRun: (state: State) => boolean) {
        this.job = stepsIfOver(seeIfShouldRun, this.job);
        return this;
    }
    runEvery(delay: number) {
        this.job = stepsEveryOver(delay, this.job);
        return this;
    }
}
