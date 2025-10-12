import React, { MouseEventHandler } from 'react';
import { Drop } from './drop';
import { NoteProps, thusNote } from './note';
import { NotesGlob } from './notes-glob';
import { toRandKey } from './reacting';

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
        whenAddingNote: MouseEventHandler<HTMLButtonElement> = _e => {
            this.setState(state => {
                let { notes } = state;
                const { notesDir } = this.props.glob;
                const filename = toRandKey() + '.txt';
                const drop = new Drop(notesDir, filename);
                const note: NoteProps = { key: toRandKey(), drop };
                notes = [...notes, note];
                return { ...state, notes } satisfies State;
            });
        };
        render() {
            const { notes } = this.state;
            return <div>
                {notes.map(note => {
                    return <Note {...note} />;
                })}
                <div>
                    <button onClick={this.whenAddingNote}>Add</button>
                </div>
            </div>;
        }
    };
}
