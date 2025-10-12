import React, { FormEventHandler } from 'react';
import { broke, fail, isNull } from '../shared/core';
import { Drop } from './drop';
import { NotesGlob } from './notes-glob';

const plainTextOnly = 'plaintext-only' as never;

export interface NoteProps {
    key: string;
    glob: NotesGlob;
    drop: Drop;
}

type State = { kind: 'not-there'; filename: string; } | { kind: 'have-no-idea' } | { kind: 'there'; text: string; };

function makeState(_props: NoteProps): State {
    return { kind: 'have-no-idea' };
}

export function thusNote() {
    return class Note extends React.Component<NoteProps, State> {

        state = makeState(this.props);

        whenChangedContent: FormEventHandler<HTMLDivElement> = async e => {
            const { currentTarget: { innerText } } = e;
            // console.log(innerText);
            const { drop } = this.props;
            await drop.willSave(innerText);
        };

        async componentDidMount() {

            const { state } = this;
            if (state.kind !== 'have-no-idea') return fail(`Fuck what: ${state.kind}`);



            const { drop } = this.props;
            const text = await drop.willLoad();
            if (isNull(text)) {
                this.setState({ kind: 'not-there', filename: drop.filename });
            } else {
                this.setState({ kind: 'there', text });
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
            const { key, drop } = this.props;
            const { state } = this;
            return <div key={key}>
                <div>{drop.dir.name}/{drop.filename}</div>
                {(() => {
                    switch (state.kind) {
                        case 'have-no-idea': return <div>Loading...</div>;
                        case 'not-there': return <div>No Name!</div>;
                        case 'there': return <div contentEditable={plainTextOnly} onInput={this.whenChangedContent}>{state.text}</div>
                        default: return broke(state);
                    }
                })()}

            </div>;
        }
    };
}
