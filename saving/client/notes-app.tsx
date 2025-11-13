import React, { MouseEventHandler } from 'react';
import { isNull, isUndefined } from '../shared/core';
import { NoteProps, thusNote } from './note';
import { NotesGlob } from './notes-glob';
import { beingNoteBox, makeNoteKey, normalizeNoteConfig, NoteConfig, NoteKey, NotesWorkspace } from './notes-workspace';
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
        whenChangingTitle = (key: NoteKey, title: string) => {
            const { workspace } = this.props;
            const found = workspace.notes.find(x => x.key === key);
            if (isUndefined(found)) return;
            found.title = title;
            this.props.onChangedWorkspace();
        }
        whenAddingNote: MouseEventHandler<HTMLButtonElement> = _e => {
            const title = prompt('Name:');
            if (isNull(title)) return;
            const key = makeNoteKey();
            const path = `${key}.txt`;
            const box = { ...beingNoteBox.defaultBox };
            const config: NoteConfig = {
                key, path, box, title,
            };
            const { workspace } = this.props;
            const note = this.makeNote(config);
            this.setState(state => {
                workspace.notes.push(config);
                let { notes } = state;
                notes = [...notes, note];
                return { ...state, note };
            }, () => this.props.onChangedWorkspace());
        };

        private makeState(): State {
            const { workspace } = this.props;
            const notes = workspace.notes.map(config => {
                return this.makeNote(config);
            });
            return { notes };
        }

        state = this.makeState();

        private makeNote(config: NoteConfig) {
            const { workspaceDir } = this.props;
            const { path, key, box, title } = normalizeNoteConfig(config);
            const drop = new TextDrop(workspaceDir, path);
            const note: NoteProps = { noteKey: key, drop, box, title, onChangedBox: this.whenChangingBox, onChangedTitle: this.whenChangingTitle };
            return note;
        }

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
