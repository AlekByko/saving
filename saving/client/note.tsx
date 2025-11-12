import React, { FormEventHandler } from 'react';
import { broke, fail, isNull } from '../shared/core';
import { enableMoving } from './moving-by-mouse';
import { NoteKey } from './notes-workspace';
import { Box } from './reading-query-string';
import { Resizable } from './resizable';
import { TextDrop } from './text-drop';

const plainTextOnly = 'plaintext-only' as never;

export interface NoteProps {
    /** cannot be just `key` because React */
    noteKey: NoteKey;
    drop: TextDrop;
    box: Box;
    title: string;
    onChangedBox: (key: NoteKey, box: Partial<Box>) => void;
}


type State = (
    | { kind: 'not-there'; filename: string; }
    | { kind: 'have-no-idea' }
    | { kind: 'there'; text: string; }
) & { x: number; y: number; };



const where = { x: 20, y: 100 };

function makeState(_props: NoteProps): State {
    return { kind: 'have-no-idea', ...where };
}

export function thusNote() {
    return class Note extends React.Component<NoteProps, State> {

        state = makeState(this.props);

        whenChangedContent: FormEventHandler<HTMLDivElement> = async e => {
            const { currentTarget: { innerText } } = e;
            // console.log(innerText);
            const { drop } = this.props;
            await drop.willOverwrite(innerText);
        };

        whenChangedBox = (box: Partial<Box>) => {
            const { noteKey } = this.props;
            this.props.onChangedBox(noteKey, box)
        };

        moving = enableMoving((() => {
            const { x, y, width, height } = this.props.box;
            return { x, y, width, height };
        })());

        async componentDidMount() {

            const { drop } = this.props;
            const text = await drop.willLoad();
            if (isNull(text)) {
                this.setState({ kind: 'not-there', filename: drop.filename, ...where });
            } else {
                this.setState({ kind: 'there', text, ...where });
            }
        }

        componentDidUpdate(_olderProps: Readonly<NoteProps>, _olderState: Readonly<State>): void {
            const { state } = this;
            switch (state.kind) {
                case 'have-no-idea': return fail('Still no idea? What?');
                case 'not-there': return;
                case 'there': return;
                default: return broke(state);
            }
        }

        render() {
            const { noteKey, drop, title, box } = this.props;
            const { state } = this;
            const where = `${drop.dir.name}/${drop.filename}`;
            return <Resizable key={noteKey} refin={this.moving.whenRootElement} className="note" onChanged={this.whenChangedBox} box={box}>
                <div className="note-header" ref={this.moving.whenHandleElement} title={where}>{title}</div>
                {(() => {
                    switch (state.kind) {
                        case 'have-no-idea': return <div>Loading...</div>;
                        case 'not-there': return <div>Not there</div>;
                        case 'there': return <div
                            className="note-content"
                            contentEditable={plainTextOnly}
                            onInput={this.whenChangedContent}>{state.text}</div>
                        default: return broke(state);
                    }
                })()}
            </Resizable>;
        }
    };
}
