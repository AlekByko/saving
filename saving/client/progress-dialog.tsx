import React, { MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';
import { isUndefined } from './shared/core';

export interface ProgressDialogProps {
    progress: number | string;
    abort?: () => void
}

export function thusProgressDialog() {
    return class ProgressDialog extends React.Component<ProgressDialogProps> {
        whenAborted: MouseEventHandler<HTMLButtonElement> = _e => {
            const { abort } = this.props;
            if (isUndefined(abort)) return;
            abort();
        };
        render() {
            const { progress, abort } = this.props;
            const text = typeof progress === 'string' ? progress : (progress * 100).toFixed(1);
            return <div className="progress-dialog">
                {text} {abort ?? <button className="off" onClick={this.whenAborted}>Abort</button>}
            </div>;
        }
    };
}


if (window.sandbox === 'progress-dialog') {
    const ProgressDialog = thusProgressDialog();
    const rootElement = document.getElementById('root')!;
    ReactDOM.render(<ProgressDialog progress={0.734} />, rootElement);
}
