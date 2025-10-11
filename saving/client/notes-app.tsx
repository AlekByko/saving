import React, { FormEventHandler } from 'react';
import { Drop } from './drop';
import { NotesGlob } from './notes-glob';

export interface NotesAppProps {
    drop: Drop;
    glob: NotesGlob;
}

export function thusNotesApp() {
    return class NotesApp extends React.Component<NotesAppProps> {
        render() {
            const { drop, glob: { notesDir } } = this.props;
            return <div>
                <div>Notes App</div>
                <div>{notesDir.name}</div>
                <div><Note drop={drop} /></div>
            </div>;
        }
    }
}

const plainTextOnly = 'plaintext-only' as never;

interface NoteProps {
    drop: Drop;
}
class Note extends React.Component<NoteProps> {
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
