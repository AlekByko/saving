import React from 'react';
import { thusLineChart } from './line-chart';

export interface TrackedNumberProps<Holder> {
    holder: Holder;
}

export function thusTrackedNumber<Holder>(
    defaults: {
        numberOf: (holder: Holder) => number,
        formatNumber: (value: number) => string,
    },
) {

    interface State {
        lastValue: number;
        delta: number;
        items: Item[];
    }

    interface Item {
        at: number;
    }
    const LineChart = thusLineChart<Item>({
        height: 50,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        width: 200,
        xOf: (_x, i) => i,
        yOf: (d, _i) => d.at,
    });

    type Props = TrackedNumberProps<Holder>;

    function makeDefaultState(props: Props): State {
        const { holder } = props;
        const value = defaults.numberOf(holder);
        return { lastValue: value, delta: 0, items: [{ at: 0 }] };
    }

    return class TrackedNumber extends React.Component<Props, State> {
        state = makeDefaultState(this.props);
        static getDerivedStateFromProps(props: Props, state: State): State | null {
            const { holder } = props;
            const value = defaults.numberOf(holder);
            const delta = value - state.lastValue;
            if (delta === 0) return null;
            const { items } = state;
            const item: Item = { at: value };
            const all = [...items, item];
            const lastFew = all.slice(-20);
            return { ...state, lastValue: value, delta, items: lastFew } satisfies State;
        }
        render() {
            const { delta, lastValue, items } = this.state;
            const trendClassModifier = seeWhatTrendClassIs(delta);
            const classes = 'tracked-number ' + trendClassModifier;
            const valueText = defaults.formatNumber(lastValue);
            const deltaSign = delta > 0 ? '+' : delta < 0 ? '-' : '';
            const deltaText = deltaSign + defaults.formatNumber(delta < 0 ? -delta : delta);
            const renderedDelta = delta !== 0 && <span className="tracked-number-delta">{deltaText}</span>;
            return <span className={classes}><LineChart items={items} />{valueText} {renderedDelta}</span>;
        }
    };
}

function seeWhatTrendClassIs(delta: number): string {
    if (delta < 0) return 'as-negative';
    if (delta > 0) return 'as-positive';
    return 'as-no-change';
}
