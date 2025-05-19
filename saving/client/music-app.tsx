import React from 'react';
import { broke, isNull } from '../shared/core';
import { willStart } from './auto-correlating-sound';

interface PianoKey {
    type: 'black' | 'white';
    name: string;
    freq: number;
}

const keys: PianoKey[] = [
    { type: 'white', name: 'C', freq: 261.63 },
    { type: 'black', name: 'C#', freq: 277.18 },
    { type: 'white', name: 'D', freq: 293.66 },
    { type: 'black', name: 'D#', freq: 311.13 },
    { type: 'white', name: 'E', freq: 329.63 },
    { type: 'white', name: 'F', freq: 349.23 },
    { type: 'black', name: 'F#', freq: 369.99 },
    { type: 'white', name: 'G', freq: 392.00 },
    { type: 'black', name: 'G#', freq: 415.30 },
    { type: 'white', name: 'A', freq: 440.00 },
    { type: 'black', name: 'A#', freq: 466.16 },
    { type: 'white', name: 'B', freq: 493.88 }
];

export interface MusicAppProps {
    ctx: AudioContext;
}

export class MusicApp extends React.Component<MusicAppProps> {
    myElement: HTMLDivElement | null = null;
    componentDidMount(): void {
        const { myElement } = this;
        if (isNull(myElement)) return;
        willStart(myElement);
    }
    render() {
        return <div>
            <div>Music App</div>
            <div ref={el => this.myElement = el}></div>
            <div className="piano-keyboard">
                {keys.map(key => {
                    switch (key.type) {
                        case 'black': {
                            return <div className="piano-black-key"></div>;
                        }
                        case 'white': {
                            return <div className="piano-white-key"></div>;
                        }
                        default: return broke(key.type);
                    }
                })}
            </div>
        </div>;
    }
}


