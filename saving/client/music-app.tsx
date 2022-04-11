import * as React from 'react';
import { AudioController } from './audio-controller';
import { NoteCircleConcern, thusNoteCircle } from './note-circle';
import { Regarding } from './reacting';
import { broke, isNonNull, isNull } from './shared/core';

export interface MusicAppProps {
}

const ns = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const count = ns.length;

// https://pages.mtu.edu/~suits/notefreqs.html
// https://pages.mtu.edu/~suits/NoteFreqCalcs.html
// https://pages.mtu.edu/~suits/scales.html
const a = Math.pow(2, 1/count); // equal tempered

const NoteCircle = thusNoteCircle(ns);

export class MusicApp extends React.Component<MusicAppProps> {

    regardingNoteCircle: Regarding<NoteCircleConcern> = concern => {

        if (isNull(this.controller)) return;

        switch(concern.about) {
            case 'be-sampled-note': {
                this.controller.makeOscillator(concern.i, a);
                return;
            }
            default: return broke(concern.about);
        }
    }

    private controller: AudioController | null =  null;

    whenStart = () => {
        if (isNonNull(this.controller)) return;
        this.controller = new AudioController();
        this.forceUpdate();
    };

    render() {
        if (isNull(this.controller)) return <div><button onClick={this.whenStart}>Start</button></div>;
        return <NoteCircle regarding={this.regardingNoteCircle} />;
    }
}
