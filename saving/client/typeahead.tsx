import * as React from 'react';
import { Point } from './geometry';
import { atBottomLeft, Regarding } from './reacting';
import { safeInside } from './shared/inside';

export interface BeEngagedConcern { about: 'be-engaged'; at: () => Point; }
export interface BeDisengagedConcern { about: 'be-disengaged'; }
export interface BeEnteredText { about: 'be-entered-text'; text: string; }
export type TypeaheadConcern =
    | { about: 'be-changed-text'; text: string; }
    | BeEnteredText
    | BeEngagedConcern
    | BeDisengagedConcern
    | { about: 'be-cancelled'; };

export interface TypeaheadProps {
    text: string;
    regarding: Regarding<TypeaheadConcern>;
}
export const inTypeaheadProps = safeInside<TypeaheadProps>();

export function thusTypeahead() {
    return class Typeahead extends React.PureComponent<TypeaheadProps> {

        static Props: TypeaheadProps;

        private whenChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
            this.props.regarding({ about: 'be-changed-text', text: e.currentTarget.value });
        }
        private whenKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const { regarding } = this.props;
            switch (e.which) {
                case 27: {
                    e.preventDefault();
                    return regarding({ about: 'be-cancelled' });
                }
                case 13: {
                    e.preventDefault();
                    return regarding({ about: 'be-entered-text', text: e.currentTarget.value });
                }
                default: return;
            }
        }
        private whenFocused = (e: React.FocusEvent<HTMLInputElement>) => {
            const { currentTarget } = e;
            this.props.regarding({ about: 'be-engaged', at: () => atBottomLeft(currentTarget) });
        }
        private whenBlurred = (_e: React.FocusEvent<HTMLInputElement>) => {
            this.props.regarding({ about: 'be-disengaged' });
        }
        render() {
            const { text } = this.props;
            return <input
                type="text"
                onChange={this.whenChanged}
                onKeyDown={this.whenKeyDown}
                onFocus={this.whenFocused}
                onBlur={this.whenBlurred}
                value={text}
            />;
        }
    };
}



