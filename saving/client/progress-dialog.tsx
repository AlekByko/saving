import React from 'react';
import ReactDOM from 'react-dom';

export interface ProgressDialogProps {
    progress: number;
}

export function thusProgressDialog() {
    return class ProgressDialog extends React.Component<ProgressDialogProps> {
        render() {
            const {progress} = this.props;
            return <div className="progress-dialog">
                {progress.toFixed(1)}%
            </div>;
        }
    };
}


if (window.sandbox === 'progress-dialog') {
    const ProgressDialog = thusProgressDialog();
    const rootElement = document.getElementById('root')!;
    ReactDOM.render(<ProgressDialog progress={0.734} />, rootElement);
}
