import React, { MouseEventHandler } from 'react';
import { broke, isNull, isUndefined } from '../shared/core';
import { AreaProps, thusArea } from './area';
import { startListening } from './eventing';
import { enableMoving, NoteDefaults, NoteProps, thusNote } from './note';
import { NotesGlob } from './notes-glob';
import { CardKey, defaultNoteBox, makeCardKey, NoteConfig, NotesWorkspaceConfig } from './notes-workspace';
import { Box } from './reading-query-string';
import { TextDrop } from './text-drop';

export interface NotesAppProps {
    workspace: NotesWorkspaceConfig;
    workspaceDir: FileSystemDirectoryHandle;
    glob: NotesGlob;
    onChangedWorkspace(): void;
}

type CardProps = AreaProps | NoteProps;

interface State {
    cards: CardProps[];
}

const grabbingClassName = 'as-grabbing';
export function thusNotesApp(defaults: NoteDefaults) {
    const Note = thusNote(defaults);
    const Area = thusArea();
    return class NotesApp extends React.Component<NotesAppProps, State> {
        whenChangingBox = (key: CardKey, box: Partial<Box>) => {
            const { workspace } = this.props;
            const found = workspace.notes.find(x => x.key === key);
            if (isUndefined(found)) return;
            found.box = { ...found.box, ...box };
            this.props.onChangedWorkspace();
        }
        whenChangingTitle = (key: CardKey, title: string) => {
            const { workspace } = this.props;
            const found = workspace.notes.find(x => x.key === key);
            if (isUndefined(found)) return;
            found.title = title;
            this.props.onChangedWorkspace();
        }
        whenAddingNote: MouseEventHandler<HTMLButtonElement> = _e => {
            const title = prompt('Name:');
            if (isNull(title)) return;
            this.createNote(0, 0, title);
        };

        createNote(x: number, y: number, title: string) {
            const cardKey = makeCardKey();
            const path = `${cardKey}.txt`;
            const config: NoteConfig = {
                kind: 'note', key: cardKey, path, box: { ...defaultNoteBox, x, y }, title,
            };
            const { workspace } = this.props;
            const note = this.makeNoteProps(config);
            this.setState(state => {
                workspace.notes.push(config);
                let { cards } = state;
                cards = [...cards, note];
                return { ...state, cards } satisfies State;
            }, () => this.props.onChangedWorkspace());
        }
        whenDeleting = (key: CardKey) => {
            const { workspace } = this.props;
            const foundAt = workspace.notes.findIndex(x => x.key === key);
            if (foundAt < 0) return console.log('No note to delete: ' + key);
            this.setState(state => {
                workspace.notes.splice(foundAt, 1);

                let { cards } = state;
                cards = cards.filter(x => x.cardKey !== key);
                return { ...state, cards } satisfies State;
            }, () => this.props.onChangedWorkspace());
        }
        notesCanvasElement: HTMLDivElement | null = null;
        notesElement: HTMLDivElement | null = null;
        nomores: Act[] = [];
        componentDidMount(): void {
            const { notesElement, notesCanvasElement } = this;
            if (isNull(notesElement) || isNull(notesCanvasElement)) return;

            this.nomores.push(startListening(notesElement, 'dblclick', e => {
                e.preventDefault();
                e.stopPropagation();
                const title = prompt();
                if (isNull(title)) return;
                const { left: canvasX, top: canvasY } = notesCanvasElement.getBoundingClientRect();
                const { clientX, clientY } = e;
                const x = clientX - canvasX;
                const y = clientY - canvasY;
                this.createNote(x, y, title);
            }));

            const { workspace } = this.props;
            notesCanvasElement.style.left = workspace.x + 'px';
            notesCanvasElement.style.top = workspace.y + 'px';
            const nomore = enableMoving(notesElement, notesCanvasElement, {
                readPos: element => {
                    const { top: y, left: x } = element.getBoundingClientRect();
                    notesElement.classList.add(grabbingClassName);
                    const pos = { x, y };
                    // console.log({ x, y });
                    return pos;
                },
                applyDelta: (element, pos, dx, dy) => {
                    element.style.top = (pos.y + dy) + 'px';
                    element.style.left = (pos.x + dx) + 'px';
                },
                reportPos: (pos, dx, dy) => {
                    console.log({ pos, dx, dy });
                    notesElement.classList.remove(grabbingClassName);
                    const { workspace } = this.props;
                    workspace.x = pos.x + dx;
                    workspace.y = pos.y + dy;
                    this.props.onChangedWorkspace();
                }
            });
            this.nomores.push(nomore);
        }
        componentWillUnmount(): void {
            this.nomores.forEach(nomore => {
                nomore();
            });
        }

        private makeState(): State {
            const { workspace } = this.props;
            const cards = workspace.notes.map(config => {
                return this.makeNoteProps(config);
            });
            return { cards };
        }

        state = this.makeState();

        private makeNoteProps(config: NoteConfig) {
            const { workspaceDir } = this.props;
            const { path, key, box, title } = config;
            const drop = new TextDrop(workspaceDir, path);
            const note: NoteProps = {
                kind: 'note',
                cardKey: key, drop, box, title,
                onChangedBox: this.whenChangingBox,
                onChangedTitle: this.whenChangingTitle,
                onDeleting: this.whenDeleting,
            };
            return note;
        }

        render() {
            const { cards } = this.state;
            return <div className="notes" ref={el => this.notesElement = el}>
                <div className="notes-canvas" ref={el => this.notesCanvasElement = el}>
                    {cards.map(card => {
                        switch(card.kind) {
                            case 'note': return <Note key={card.cardKey} {...card} />
                            case 'area': return <Area key={card.cardKey} {...card} />
                            default: return broke(card);
                        }
                    })}
                </div>
                <div className="notes-toolbar">
                    <button onClick={this.whenAddingNote}>Add</button>
                </div>
            </div>;
        }
    };
}
