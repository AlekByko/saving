import * as React from 'react';
import { to } from './shared/core';

export interface NumbericValueEditortProps {
    value: number;
    context: any;
    onChange: (value: number) => void;
}

interface State {
    text: string;
}

export function thusNumericValueEditor(size: number) {
    return class NumericValueEditor extends React.Component<NumbericValueEditortProps> {
        state = to<State>({ text: String(this.props.value) });
        render() {
            const { onChange } = this.props;
            const { text } = this.state;
            return <input
                value={text}
                size={size}
                onChange={e => {
                    const text = e.currentTarget.value;
                    this.setState({ text });
                }}
                onBlur={e => {
                    const text = e.currentTarget.value
                    const value = Number(text);
                    if (!isFinite(value)) return;
                    onChange(value);
                }}
            />;
        }
    };
}
