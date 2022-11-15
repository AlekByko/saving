import React from 'react';
import ReactDOM from 'react-dom';
import { isNull } from './shared/core';

export interface DialogProps{
}

export class Dialog extends React.Component<DialogProps> {
    private dialogElement = document.createElement('div');

    componentDidMount() {
        const surfaceElement = document.getElementById('surface');
        if (isNull(surfaceElement)) return;
        this.dialogElement.classList.add('dialog');
        surfaceElement.appendChild(this.dialogElement);
    }
    componentWillUnmount() {
        const surfaceElement = document.getElementById('surface');
        if (isNull(surfaceElement)) return;
        surfaceElement.removeChild(this.dialogElement);
    }
    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.dialogElement,
        );
    }
}
