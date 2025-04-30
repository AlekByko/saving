import React from "react";
import { addClassIf } from './reacting';

export interface FlyoutProps {
    text: string;
    timesRan: number;
}

export class Flyout extends React.PureComponent<FlyoutProps> {
    render() {
        const { text, timesRan } = this.props;
        const isEven = timesRan % 2 === 0;
        const isOdd = !isEven;
        const classes = 'flyout' + addClassIf(isOdd, 'as-odd') + addClassIf(isEven, 'as-even');
        return <div className={classes}>{text}</div>;
    }
}
