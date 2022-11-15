import React from 'react';

export interface WordEditorProps {
    text: string;
    onClose: () => void;
}
export class WordEditor extends React.PureComponent<WordEditorProps> {
    render() {
        const { text, onClose } = this.props;
        return <div>
            <div>{text}</div>
            <div>
                <button onClick={onClose}>Reset</button>
            </div>
        </div>
    }
}
