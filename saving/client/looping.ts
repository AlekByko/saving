import { wait } from './promises';
import { isNonNull, isUndefined } from './shared/core';
import { Timestamp, toTimestamp } from './shared/time-stamping';

export type DefaultContext = unknown;
export type TaskResult<State, Context = DefaultContext> = [State, Context];
export type Task<State, ContextIn = DefaultContext, ContextOut = DefaultContext> =
    (state: State, context: ContextIn) => Promise<TaskResult<State, ContextOut>>;
export type Job<State> = (state: State) => Task<State>[];
export interface JobController { shouldFinish: boolean; dontWait: () => void; }

export async function willBeWorking<State>(
    state: State,
    willDigest: (state: State) => Promise<void>,
    jobs: Job<State>[],
    controller: JobController,
    replenish: (jobs: Job<State>[]) => void,
    delay: number,
): Promise<State> {
    let lastState = state;
    let shouldWait = false;
    await willDigest(lastState); // <-- first rerender
    while (true) {
        if (controller.shouldFinish) return lastState;

        // trying get the last job
        let job = jobs.shift();
        if (isUndefined(job)) {

            // there are no jobs
            if (shouldWait) {
                await wait(delay, controller);
            }

            replenish(jobs);

            shouldWait = true; // <-- assuming the worse
            job = jobs.shift();
            if (isUndefined(job)) return lastState; // <-- no jobs
        }

        // there is a job, so we can get tasks
        const tasks = job(lastState);
        let lastContext: DefaultContext = undefined;
        for (const task of tasks) {
            const [nextState, nextContext] = await task(lastState, lastContext);
            lastContext = nextContext;

            // if a tasks gives the same state, then we skip
            if (nextState === lastState) continue;

            // if a task give a different state we render it
            await willDigest(nextState);

            lastState = nextState;

            shouldWait = false; // <-- we had at least one async operation resulting into state change, so no need to add a pause before replenishing jobs

            // ...going to next task
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

export function nowJobOver<State, Stuff>(
    willEmit: () => Promise<Stuff>,
    willApply: (state: State, stuff: Stuff) => Promise<State>,
) {
    return function emitJob(_state: State): Task<State>[] {
        async function task(state: State): Promise<[State, DefaultContext]> {
            const stuff = await willEmit();
            state = await willApply(state, stuff);
            return [state, undefined];
        }
        return [task];
    };
}
export function laterJobOver<State, Stuff>(
    willEmit: () => Promise<Stuff>,
) {
    return function emitJob(_state: State): Task<State>[] {
        async function task(state: State): Promise<[State, DefaultContext]> {
            const stuff = await willEmit();
            return [state, stuff];
        }
        return [task];
    };
}

export function jobingFor<State>() {
    return new JobBuilderFirst<State>();
}
export class JobBuilderFirst<State> {

    quick(step: (state: State) => State) {
        const task: Task<State> = async (state, context) => [step(state), context];
        return new JobBuilderLater<State>(_state => [task]);
    }

    long(step: (state: State) => Promise<State>) {
        const task: Task<State> = async (state, context) => [await step(state), context];
        return new JobBuilderLater<State>(_state => [task]);
    }

    now<Stuff>(
        willEmit: () => Promise<Stuff>,
        willApply: (state: State, stuff: Stuff) => Promise<State>
    ) {
        return new JobBuilderLater<State>(nowJobOver(willEmit, willApply));
    }

    later<Stuff>(willEmit: () => Promise<Stuff>) {
        return new JobBuilderLater<State>(laterJobOver(willEmit));
    }

}
export class JobBuilderLater<State> {
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
    overTo<R>(over: (builder: JobBuilderLater<State>) => R): R {
        return over(this);
    }
    inContextOf<Context>() : TaskCollector<State, Context> {
        return new TaskCollector<State, Context>([]);
    }
}

export class TaskCollector<State, ContextIn> {
    constructor(
        public tasks: Task<State>[],
    ) {
    }
    task<ContextOut>(task: Task<State, ContextIn, ContextOut>) : TaskCollector<State, ContextOut>{
        this.tasks.push(task as any);
        return this as any;
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

