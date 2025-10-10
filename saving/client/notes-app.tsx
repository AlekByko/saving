import React, { FormEventHandler } from 'react';
import { NotesGlob } from './notes-glob';

export interface NotesAppProps {
    glob: NotesGlob;
}



export function thusNotesApp() {
    return class NotesApp extends React.Component<NotesAppProps> {
        render() {
            const { notesDir } = this.props.glob;
            return <div>
                <div>Notes App</div>
                <div>{notesDir.name}</div>
                <div><Note /></div>
            </div>;
        }
    }
}

const plainTextOnly = 'plaintext-only' as never;

class Note extends React.Component {
    whenChangedContent: FormEventHandler<HTMLDivElement> = e => {
        const { currentTarget: { innerText } } = e;
        console.log(innerText);
    };
    render() {
        return <div>
            <div>Note</div>
            <div>
                <div contentEditable={plainTextOnly} onInput={this.whenChangedContent}>Test</div>
            </div>
        </div>;
    }
}
