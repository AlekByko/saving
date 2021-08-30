import { isUndefined } from './shared/core';

export const noChange = Symbol('no-change');
export type NoChange = typeof noChange;

export interface QueueFrame<State> {
    (state: State): Promise<State | NoChange>;
    title?: string;
}
export function toAsyncQueue<State>(
    state: State,
    runBefore: (state: State, title: string | undefined) => State,
    willRunAfter: (state: State, title: string | undefined) => Promise<State>,
    willApply: (state: State) => Promise<void>,
) {
    let all: QueueFrame<State>[] = [];

    willNeverStopExecuting(state, runBefore, willApply, willRunAfter, all);

    return {
        onTick(
            delay: number,
            willDo: (state: State) => Promise<State | NoChange>,
            title?: string,
        ) {
            function repeat() {
                const frame: QueueFrame<State> = async state => {
                    const result = await willDo(state);
                    setTimeout(repeat, delay);
                    return result;
                };
                frame.title = title;
                all.push(frame);
            }
            repeat();
        },
        facingOf<Concern>(willFace: (state: State, concern: Concern) => Promise<State | NoChange>) {
            return function face(concern: Concern) {
                all.push(async state => {
                    return await willFace(state, concern);
                });
            }
        },
        oneOf<T>(
            willDo: (state: State, values: T) => Promise<State>,
            title?: string,
        ) {
            return async function queue(values: T) {
                const frame: QueueFrame<State> = state => willDo(state, values);
                frame.title = title;
                all.push(frame);
            }
        },
        bulkOf<T>(
            willDo: (state: State, values: T[]) => Promise<State>,
            maxBulkSize: number,
            delay: number,
            title?: string,
        ) {
            let buffer: T[] = [];
            let scheduled = 0;
            return async function queue(value: T) {
                clearTimeout(scheduled);
                buffer.push(value);
                if (buffer.length >= maxBulkSize) {
                    const values = [...buffer];
                    buffer = [];
                    const frame: QueueFrame<State> = state => willDo(state, values);
                    frame.title = title;
                    all.push(frame);
                } else {
                    scheduled = window.setTimeout(async function () {
                        const values = [...buffer];
                        buffer = [];
                        const frame: QueueFrame<State> = state => willDo(state, values);
                        frame.title = title;
                        all.push(frame);
                    }, delay);
                }
            }
        }
    };
}


async function willNeverStopExecuting<State>(
    state: State,
    runBefore: (state: State, title: string | undefined) => State,
    willApply: (state: State) => Promise<void>,
    willRunAfter: (state: State, title: string | undefined) => Promise<State>,
    all: QueueFrame<State>[],
) {
    await willApply(state);
    while (true) {
        const willDo = all.shift();
        if (isUndefined(willDo)) {
            await wait(100);
        } else {
            state = runBefore(state, willDo.title);
            await willApply(state);
            const done = await willDo(state);
            if (done === noChange) {
                state = await willRunAfter(state, willDo.title);
                await willApply(state);
            } else {
                state = await willRunAfter(done, willDo.title);
                await willApply(state);
            }
        }
    }
}

export async function wait(delay: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, delay);
    });
}
