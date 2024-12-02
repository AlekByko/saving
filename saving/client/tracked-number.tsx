import React from 'react';

export interface TrackedNumberProps {
    value: number;
}

interface State {
    lastValue: number;
    delta: number;
}

export function thusTrackedNumber() {

    type Props = TrackedNumberProps;

    function makeDefaultState(props: Props): State {
        return { lastValue: props.value, delta: 0 };
    }

    return class TrackedNumber extends React.Component<Props, State> {
        state = makeDefaultState(this.props);
        static getDerivedStateFromProps(props: Props, state: State): State | null {
            const delta = state.lastValue - props.value;
            return { ...state, lastValue: props.value, delta } satisfies State;
        }
        render() {
            const { delta, lastValue } = this.state;
            const trendClassModifier = seeWhatTrendClassIs(delta);
            const classes = 'tracked-number ' + trendClassModifier;
            const renderedDelta = delta !== 0 && <span className="tracked-number-delta">{delta}</span>;
            return <span className={classes}>{lastValue} {renderedDelta}</span>;
        }
    };
}

function seeWhatTrendClassIs(delta: number): string {
    if (delta < 0) return 'as-negative';
    if (delta > 0) return 'as-positive';
    return 'as-no-change';
}
