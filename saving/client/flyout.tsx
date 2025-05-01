import React from "react";
import { isNull } from '../shared/core';
import { addClassIfDefined, reflowUI } from './reacting';

export interface FlyoutProps {
    text: string;
    timesRan: number;
    className?: string;
}

interface State {
    lastTimesRanOfProps: number;
    timesChanged: number;
}

function makeState(props: FlyoutProps): State {
    return {
        lastTimesRanOfProps: props.timesRan,
        timesChanged: 0,
    };
}

export class Flyout extends React.Component<FlyoutProps, State> {

    state = makeState(this.props);

    static getDerivedStateFromProps(props: FlyoutProps, state: State): State | null {
        const { timesRan } = props;
        if (state.lastTimesRanOfProps !== timesRan) {
            let { timesChanged } = state;
            timesChanged += 1;
            state = { ...state, lastTimesRanOfProps: timesRan, timesChanged }
        }
        return state;
    }

    private element: HTMLDivElement | null = null;

    componentDidUpdate(_: FlyoutProps, olderState: State): void {
        const { state, element } = this;
        if (isNull(element)) return;
        if (state.timesChanged !== olderState.timesChanged) {
            element.classList.remove('as-animated');
            reflowUI(element);
            element.classList.add('as-animated');
        }
    }

    render() {
        const { text, className } = this.props;
        const classes = 'flyout' + addClassIfDefined(className);
        return <div className={classes} ref={x => this.element = x}>{text}</div>;
    }
}

