import { ChangeEvent, MouseEvent } from 'react';
import { isDefined, isNull } from '../shared/core';
import { $across, $assign, $of, $on, $where, By, inside } from '../shared/inside';

export interface Stateful<State> {
    state: State;
    scheduleModelConfigSaving(): void;
    setState(across: (state: State) => State | null, then?: Act): void;
}

const notParsed = Symbol('not-parsed');
type NotParsed = typeof notParsed;
export function parseInteger(text: string): number | NotParsed {
    const parsed = parseInt(text, 10);
    if (isFinite(parsed)) return parsed;
    return notParsed;
}
export const uponAnchorClick = {
    setBoth<State extends { config: Config | null; }, Config, Value>(
        stateful: Stateful<State>,
        byState: By<State, Value>,
        byConfig: By<Config, Value>,
        across: (value: Value) => Value,
    ) {
        return function whenClicked(e: MouseEvent<unknown>): Promise<void> {
            e.preventDefault();
            e.stopPropagation();
            return new Promise(resolve => {
                return stateful.setState(state => {
                    const olderState = state;
                    const newerState = byState[$across](olderState, across);
                    return newerState;
                }, () => {
                    const { state } = stateful;
                    const fine = byState[$of](state);
                    const { config } = state;
                    if (isNull(config)) {
                        console.warn(`No config. Unable to set: ${byConfig[$where]()}`, fine);
                    } else {
                        byConfig[$assign](config, fine);
                        stateful.scheduleModelConfigSaving();
                    }
                    resolve();
                });
            });
        };
    }
}

export function inCaseOf<Event, Crude>(
    byEvent: By<Event, Crude>
) {
    return {
        setBoth<State extends { config: Config | null; }, Config, Fine>(
            stateful: Stateful<State>,
            byState: By<State, Fine>,
            byConfig: By<Config, Fine>,
            parse: (value: Crude, state: State) => Fine | NotParsed,
        ) {
            return function settingValue(e: Event): Promise<void> {
                const crude = byEvent[$of](e); // <-- has to be here because event doesn't live long
                return new Promise(resolve => {
                    stateful.setState(state => {
                        const olderState = state;
                        const fine = parse(crude, olderState);
                        if (fine === notParsed) {
                            console.warn(`Unable parse e${byEvent[$where]()} to set state${byState[$where]}`, crude);
                            debugger;
                            window.document.title = '!!! SITUATION !!!';
                            console.warn(crude);
                            console.warn(state);
                            return null;
                        } else {
                            const newerState = byState[$on](olderState, fine);
                            return newerState;
                        }
                    }, () => {
                        const { state } = stateful;
                        const fine = byState[$of](state);
                        const { config } = state;
                        if (isNull(config)) {
                            console.warn(`No config. Unable to set: ${byConfig[$where]()}`, fine);
                        } else {
                            byConfig[$assign](config, fine);
                            stateful.scheduleModelConfigSaving();
                        }
                        resolve();
                    });
                })
            };
        },
        setState<State, Fine>(
            stateful: Stateful<State>,
            byState: By<State, Fine>,
            parse: (value: Crude, state: State) => Fine | NotParsed,
            then?: Act,
        ) {
            return function settingValue(e: Event): void {
                const crude = byEvent[$of](e); // <-- has to be here because event doesn't live long
                return stateful.setState(state => {
                    const olderState = state;
                    const fine = parse(crude, olderState);
                    if (fine === notParsed) {
                        console.warn(`Unable parse e${byEvent[$where]()} to set state${byState[$where]}`, crude);
                        debugger;
                        window.document.title = '!!! SITUATION !!!';
                        console.warn(crude);
                        console.warn(state);
                        return null;
                    } else {
                        const newerState = byState[$on](olderState, fine);
                        return newerState;
                    }
                }, isDefined(then) ? then : undefined);
            };
        },
    };
}
const inTextareaChangeEvent = inside<ChangeEvent<HTMLTextAreaElement>>();
const inInputChangeEvent = inside<ChangeEvent<HTMLInputElement>>();
export const uponChangedTexarea = inCaseOf(inTextareaChangeEvent.currentTarget.value);
export const uponChangedInput = inCaseOf(inInputChangeEvent.currentTarget.value);

