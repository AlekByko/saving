import { MouseEvent } from 'react';
import { isDefined, isNull } from '../shared/core';
import { $across, $assign, $of, $on, $where, By } from '../shared/inside';

export interface Statefull<State> {
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
        stateful: Statefull<State>,
        byState: By<State, Value>,
        byConfig: By<Config, Value>,
        across: (value: Value) => Value,
        then?: Act,
    ) {
        return function whenClicked(e: MouseEvent<unknown>): void {
            e.preventDefault();
            e.stopPropagation();
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
                    return;
                }
                byConfig[$assign](config, fine);
                stateful.scheduleModelConfigSaving();
                if (isDefined(then)) {
                    then();
                }
            });
        };
    }
}

export function inCaseOf<Event, Crude>(
    byEvent: By<Event, Crude>
) {
    return {
        setBoth<State extends { config: Config | null; }, Config, Fine>(
            stateful: Statefull<State>,
            byState: By<State, Fine>,
            byConfig: By<Config, Fine>,
            parse: (value: Crude, state: State) => Fine | NotParsed,
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
                }, () => {
                    const { state } = stateful;
                    const fine = byState[$of](state);
                    const { config } = state;
                    if (isNull(config)) {
                        console.warn(`No config. Unable to set: ${byConfig[$where]()}`, fine);
                        return;
                    }
                    byConfig[$assign](config, fine);
                    stateful.scheduleModelConfigSaving();
                });
            };
        },
        setState<State, Fine>(
            stateful: Statefull<State>,
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
