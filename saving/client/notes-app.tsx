import React from 'react';
import { NoteProps, thusNote } from './note';
import { NotesGlob } from './notes-glob';

export interface NotesAppProps {
    notes: NoteProps[];
    glob: NotesGlob;
}

interface State {
    notes: NoteProps[];
}

function makeState({ notes }: NotesAppProps): State {
    return { notes };
}

export function thusNotesApp() {
    const Note = thusNote();
    return class NotesApp extends React.Component<NotesAppProps, State> {
        state = makeState(this.props);
        render() {
            const { notes } = this.state;
            return <div>
                {notes.map(note => {
                    return <Note {...note} />;
                })}
            </div>;
        }
    };
}
