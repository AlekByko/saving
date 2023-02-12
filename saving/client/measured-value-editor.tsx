import React from 'react';
import { ReactConstructor } from './reacting';

export interface MeasuredValue<Value, Unit> {
    value: Value;
    unit: Unit;
}

export interface MeasuredEditorProps<Value, Unit, Context> {
    value: MeasuredValue<Value, Unit>;
    context: Context;
    onChange: (measured: MeasuredValue<Value, Unit>) => void;
}

interface ValueEditorProps<Value, Context> { // should not be exported, for internal use only, works as a constraint
    value: Value;
    context: Context;
    onChange: (value: Value) => void;
}

interface UnitEditorProps<Unit, Context> { // should not be exported, for internal use only, works as a constraint
    value: Unit;
    context: Context;
    onChange: (value: Unit) => void;
}

export function thusMeasuredEditor<Value, Unit, Context>(
    ValueEditor: ReactConstructor<ValueEditorProps<Value, Context>>,
    UnitEditor: ReactConstructor<UnitEditorProps<Unit, Context>>,
) {
    return class MeasuredEditor extends React.Component<MeasuredEditorProps<Value, Unit, Context>> {
        render() {
            const { value: { value, unit }, context, onChange } = this.props;
            return <span>
                <ValueEditor
                    value={value}
                    context={context}
                    onChange={value => onChange({ value, unit })}
                /> <UnitEditor
                    value={unit}
                    context={context}
                    onChange={unit => onChange({ value, unit })}
                /></span>;
        }
    }
}
