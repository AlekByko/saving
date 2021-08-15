import * as React from 'react';
import { inside } from './inside';
import { Regarding } from './reacting';
import { EmptyString } from './texting';

export type FilterTextConcern =
    | { about: 'be-typed-text'; text: string; }
    | { about: 'be-entered-text'; text: string; }
    | { about: 'be-cancelled-text'; };

export type SetFilterCriteria = string;
export type FilterCriteria = SetFilterCriteria | EmptyString;
export function isThereFilterCriteria(criteria: FilterCriteria): criteria is SetFilterCriteria {
    return criteria !== '';
}

export interface FilterTextProps {
    criteria: FilterCriteria;
    regarding: Regarding<FilterTextConcern>;
}
export const inFilterTextProps = inside<FilterTextProps>();

export class FilterText extends React.PureComponent<FilterTextProps> {
    render() {
        const { criteria, regarding } = this.props;
        const text = isThereFilterCriteria(criteria) ? criteria : '';
        return <div>
            <input type="text" value={text} onChange={e => {
                regarding({ about: 'be-typed-text', text: e.currentTarget.value });
            }} onKeyDown={e => {
                switch (e.which) {
                    case 13: {
                        e.preventDefault();
                        return regarding({ about: 'be-entered-text', text: e.currentTarget.value });
                    }
                    case 27: {
                        e.preventDefault();
                        return regarding({ about: 'be-cancelled-text' });
                    }
                    default: return;
                }
            }} />
        </div>;
    }
}
