import * as React from 'react';
import { Regarding } from './reacting';

const size = 700;
const hpad = 100;
const vpad = 50;
const width = size;
const height = size;
const cx0 = width / 2 + hpad;
const cy0 = height / 2 + vpad;
const r = width / 2;
const twoPi = Math.PI * 2;
const alpha0 = -Math.PI / 2;

export type NoteCircleConcern =
    | { about: 'be-sampled-note'; i: number; }

export interface NoteCircleProps {
    regarding: Regarding<NoteCircleConcern>;
}

export function thusNoteCircle(ns: string[]) {
    const count = ns.length;
    return class NoteCircle extends React.Component<NoteCircleProps> {
        render() {
            return <svg width={width + hpad * 2} height={height + vpad * 2}>
                <g transform={`translate(${cx0} ${cy0})`}>
                    {ns.map((text, i) => {
                        const alpha = alpha0 + twoPi * i / count;
                        const cy = Math.sin(alpha) * r;
                        const cx = Math.cos(alpha) * r;
                        return <g key={text} transform={`translate (${cx} ${cy})`}>
                            <circle r={5} onMouseEnter={() => {
                                this.props.regarding({ about: 'be-sampled-note', i });
                            }} />
                            <g key={text} transform={`translate (${cx * 0.08 - 5} ${cy * 0.08 + 5})`}>
                                <text>{text}</text>
                            </g>
                        </g>;
                    })}
                </g>
            </svg>;
        }
    };
}
