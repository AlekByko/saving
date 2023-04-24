import { wait } from './promises';
import { isNonNull, isUndefined } from './shared/core';

export interface RunnerContext<Concern, Props> {
    isRunning: boolean;
    waiting: Concern[];
    props: Props;
}

export function toRunnerContextOf<Concern, Props>(props: Props) {
    let isRunning = false;
    const waiting: Concern[] = [];
    return {isRunning, waiting, props}
}

export function toRunnerOf<Concern, Props>(
    faceConcern: (props: Props, concern: Concern) => Props,
    render: (props: Props) => void,
    doEffect: (concern: Concern, props: Props) => Promise<Concern | null>,
) {

    return async function run(context: RunnerContext<Concern, Props>, concern: Concern): Promise<void> {
        if (context.isRunning) {
            context.waiting.push(concern);
        } else {
            context.isRunning = true;
            context.props = faceConcern(context.props, concern);
            render(context.props);
            const finished = await doEffect(concern, context.props);
            if (isNonNull(finished)) {
                context.props = faceConcern(context.props, finished);
                render(context.props);
            }
            await wait(0);
            const next = context.waiting.pop();
            if (isUndefined(next)) return;
            run(context, next);
        }
    }
}

