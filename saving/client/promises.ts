import { isDefined } from './shared/core';

export async function wait(delay: number, controller?: { dontWait: () => void }): Promise<void> {
    return new Promise<void>(resolve => {
        const scheduled = window.setTimeout(resolve, delay);
        if (isDefined(controller)) {
            controller.dontWait = () => {
                clearTimeout(scheduled);
                resolve();
            };
        }
    });
}
