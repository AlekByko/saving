import React, { MouseEventHandler } from 'react';
import { isNull, isUndefined } from '../shared/core';
import { NoteProps, thusNote } from './note';
import { NotesGlob } from './notes-glob';
import { makeDefaultNoteBox, makeNoteKey, normalizeNoteConfig, NoteConfig, NoteKey, NotesWorkspace } from './notes-workspace';
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
            const box = makeDefaultNoteBox();
            const config: NoteConfig = {
                key, path, box, title,
            };
            const { workspace } = this.props;
            const note = this.makeNote(config);
            this.setState(state => {
                workspace.notes.push(config);
                let { notes } = state;
                notes = [...notes, note];
                return { ...state, notes } satisfies State;
            }, () => this.props.onChangedWorkspace());
        };
        whenDeleting = (key: NoteKey) => {
            const { workspace } = this.props;
            const foundAt = workspace.notes.findIndex(x => x.key === key);
            if (foundAt < 0) return console.log('No note to delete: ' + key);
            this.setState(state => {
                workspace.notes.splice(foundAt, 1);

                let { notes } = state;
                notes = notes.filter(x => x.noteKey !== key);
                return { ...state, notes } satisfies State;
            }, () => this.props.onChangedWorkspace());
        }

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
            const note: NoteProps = {
                noteKey: key, drop, box, title,
                onChangedBox: this.whenChangingBox,
                onChangedTitle: this.whenChangingTitle,
                onDeleting: this.whenDeleting,
            };
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
