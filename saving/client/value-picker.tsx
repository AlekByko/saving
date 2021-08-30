import * as React from 'react';
import { Regarding } from './reacting';
import { same } from './shared/core';

export type ValuePickerConcern<T> =
    | { about: 'be-picked'; picked: T; };

export interface ValuePickerProps<T> {
    values: T[];
    picked: T;
    regarding: Regarding<ValuePickerConcern<T>>;
}

export function thusValuePickerOf<T>(
    toKey: (value: T) => string,
    format: (value: T) => string,
) {
    return class ValuePicker extends React.PureComponent<ValuePickerProps<T>> {

        static Props: ValuePickerProps<T>;
        static Concern: ValuePickerConcern<T>;

        private whenPicked: React.ChangeEventHandler<HTMLSelectElement> = e => {
            const {values, regarding} = this.props;
            const {selectedIndex} = e.currentTarget;
            if (selectedIndex < 0) return;
            const picked = values[selectedIndex];
            regarding({ about: 'be-picked', picked });
        }

        render() {
            const { values, picked } = this.props;
            return <div>
                <select onChange={this.whenPicked} value={toKey(picked)}>
                    {values.map(value => {
                        const key = toKey(value);
                        const formatted = format(value);
                        return <option key={key} value={key}>{formatted}</option>
                    })}
                </select>
            </div>;
        }
    }
}

export const StringPicker = thusValuePickerOf<string>(same, same);
export type StringPickerProps = typeof StringPicker.Props;
export type StringPickerConcern = typeof StringPicker.Concern;
