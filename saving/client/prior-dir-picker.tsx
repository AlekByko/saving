import React from 'react';
import { Regarding } from './reacting';

export type PriorDirPickerConcern =
    | {};

export interface PriorDirPickerProps {
    regarding: Regarding<PriorDirPickerConcern>;
}

export class PriorDirPicker extends React.Component<PriorDirPickerProps> {
    render() {
        return <div>Hi!</div>;
    }
}

