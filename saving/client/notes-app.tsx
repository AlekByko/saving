import React, { MouseEventHandler } from 'react';
import { isUndefined } from '../shared/core';
import { NoteProps, thusNote } from './note';
import { NotesGlob } from './notes-glob';
import { normalizeNoteConfig, NoteKey, NotesWorkspace } from './notes-workspace';
import { Box } from './reading-query-string';
import { TextDrop } from './text-drop';

export interface NotesAppProps {
    workspace: NotesWorkspace;
    workspaceDir: FileSystemDirectoryHandle;
    glob: NotesGlob;
    onChangedWorkspace(): void;
}

interface State {
    notes: NoteProps[];
}


export function thusNotesApp() {
    const Note = thusNote();
    return class NotesApp extends React.Component<NotesAppProps, State> {
        whenChangingBox = (key: NoteKey, box: Partial<Box>) => {
            const { workspace } = this.props;
            const found = workspace.notes.find(x => x.key === key);
            if (isUndefined(found)) return;
            found.box = { ...found.box, ...box };
            this.props.onChangedWorkspace();
        }
        whenAddingNote: MouseEventHandler<HTMLButtonElement> = _e => {

        };
        private makeState({ workspace, workspaceDir }: NotesAppProps): State {
            const notes = workspace.notes.map(config => {
                const { path, key, box, title } = normalizeNoteConfig(config);
                const drop = new TextDrop(workspaceDir, path);
                const note: NoteProps = { noteKey: key, drop, box, title, onChangedBox: this.whenChangingBox };
                return note;
            });
            return { notes };
        }
        state = this.makeState(this.props);

        render() {
            const { notes } = this.state;
            return <div className="notes">
                {notes.map(note => {
                    return <Note {...note} />;
                })}
                <div className="notes-toolbar">
                    <button onClick={this.whenAddingNote}>Add</button>
                </div>
            </div>;
        }
    };
}
