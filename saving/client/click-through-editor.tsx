import React from 'react';
import { nextAtAround } from './shared/numbers';

export interface ClickThroughEditorProps<Value extends string, Context> {
    value: Value;
    context: Context;
    onChange: (value: Value) => void;
}

export function thusClickThroughEditor<Value extends string, Context>(
    relationsOf: (context: Context) => Value[],
) {
    return class ClickThroughEditor extends React.Component<ClickThroughEditorProps<Value, Context>> {

        render() {
            const { value, context, onChange } = this.props;
            const relations = relationsOf(context);
            const at = relations.indexOf(value);
            return <a href="#" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                const nextAt = nextAtAround(relations, at, +1);
                this.setState({ at: nextAt });
                const next = relations[nextAt];
                onChange(next);
            }}>{value}</a>;
        }
    };
}
