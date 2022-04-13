import * as React from 'react';
import { AudioController } from './audio-controller';
import { NoteCircleConcern, thusNoteCircle } from './note-circle';
import { Regarding } from './reacting';
import { iterate } from './shared/arrays';
import { broke, isNonNull, isNull } from './shared/core';

export interface MusicAppProps {
}

// https://pages.mtu.edu/~suits/notefreqs.html
// https://pages.mtu.edu/~suits/NoteFreqCalcs.html
// https://pages.mtu.edu/~suits/scales.html
const count = 12;
const a = Math.pow(2, 1 / count); // equal tempered
const startFreq = 440;
const ns = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const just = [1, 1.0417, 1.1250, 1.2000, 1.2500, 1.3333, 1.4063, 1.5000, 1.6000, 1.6667, 1.8000, 1.8750];
const tempered = iterate(0, 1, 12, i => Math.pow(a, i));
void just, tempered;
const scale = tempered;

const NoteCircle = thusNoteCircle(ns, scale, startFreq);

export class MusicApp extends React.Component<MusicAppProps> {
    private picked: number[] = [];
    regardingNoteCircle: Regarding<NoteCircleConcern> = concern => {

        if (isNull(this.controller)) return;

        switch (concern.about) {
            case 'be-sampled-note': {
                this.picked.push(concern.i);
                return;
            }
            default: return broke(concern.about);
        }
    }

    private controller: AudioController | null = null;

    whenStart = () => {
        if (isNonNull(this.controller)) return;
        this.controller = new AudioController(scale, startFreq);
        this.forceUpdate();
    };
    whenGo = () => {
        const {picked, controller} = this;
        if (isNull(controller)) return;
        controller.makeChord(picked);
    }
    render() {
        if (isNull(this.controller)) return <div><button onClick={this.whenStart}>Start</button></div>;

        return <div>
            <NoteCircle regarding={this.regardingNoteCircle} />
            <div>
                <button onClick={this.whenGo}>Go</button>
            </div>
        </div>;
    }
}
