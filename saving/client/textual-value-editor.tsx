import * as React from 'react';
import { to } from './shared/core';

export interface TextualValueEditortProps {
    value: string;
    context: any;
    onChange: (value: string) => void;
}

interface State {
    text: string;
}

export function thusTextualValueEditor(size: number) {
    return class NumericValueEditor extends React.Component<TextualValueEditortProps> {
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
                    onChange(text);
                }}
            />;
        }
    };
}
