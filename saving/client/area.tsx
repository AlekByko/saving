import React from 'react';
import { thusBoxed } from './boxed';
import { Box } from './doing-image-coordinates';
import { CardKey } from './notes-workspace';
import { Regarding } from './reacting';

export interface AreaProps {
    areaKey: CardKey;
    box: Box;
    title: string;
    regarding: Regarding<AreaConcern>;
}
export type AreaConcern =
    | { about: 'be-deleted-area'; areaKey: CardKey; }
    | { about: 'be-changed-area-box'; areaKey: CardKey; box: Partial<Box>; }
    | { about: 'be-changed-area-title'; areaKey: CardKey; title: string; };

export function thusArea() {

    const Boxed = thusBoxed({
        boxOf: (props: AreaProps) => props.box,
        titleOf: ({ title }) => title,
        onChangedBox: ({ regarding, areaKey }, box) => regarding({ about: 'be-changed-area-box', areaKey, box }),
        onChangedTitle: ({ regarding, areaKey }, title) => regarding({ about: 'be-changed-area-title', areaKey, title }),
        onDeleting: ({ regarding, areaKey }) => regarding({ about: 'be-deleted-area', areaKey }),
    });
    return class Area extends React.Component<AreaProps> {
        render() {
            return <Boxed {...this.props}>
                Area
            </Boxed>;
        }
    };
}
