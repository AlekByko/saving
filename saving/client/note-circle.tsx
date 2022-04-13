import * as React from 'react';
import { Regarding } from './reacting';
import { iterate } from './shared/arrays';

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
const angles = iterate(0, Math.PI / 90, 20000, x => x);
console.log(angles);


export type NoteCircleConcern =
    | { about: 'be-sampled-note'; i: number; }

export interface NoteCircleProps {
    regarding: Regarding<NoteCircleConcern>;
}

export function thusNoteCircle(ns: string[], scale: number[], startFreq: number) {

    return class NoteCircle extends React.Component<NoteCircleProps> {
        render() {
            return <svg width={width + hpad * 2} height={height + vpad * 2}>
                <g transform={`translate(${cx0} ${cy0})`}>
                    {<path d={spiral(angles)} fill="none" stroke="red" />}
                    {ns.map((text, i) => {
                        const alpha = alpha0 + twoPi * (scale[i] - 1);
                        const cy = Math.sin(alpha - alpha0) * r;
                        const cx = Math.cos(alpha - alpha0) * r;

                        const freq = startFreq * scale[i];
                        return <g key={text} transform={`translate (${cx} ${cy})`}>
                            <circle r={5} onClick={() => {
                                console.log(i);
                                this.props.regarding({ about: 'be-sampled-note', i });
                            }} />
                            <g key={text} transform={`translate (${cx * 0.08 - 5} ${cy * 0.08 + 5})`}>
                                <text>{text}: {freq}</text>
                            </g>
                        </g>;
                    })}
                </g>
            </svg>;
        }
    };
}

const n = 15;
function spiral(angles: number[]) {
    const [first, ...rest] = angles;
    const [x0, y0] = toXY(first);
    const result : string[] = [];
    result.push(`M ${x0} ${y0}`);
    rest.forEach(angle => {
        const [x, y] = toXY(angle);
        result.push(`L ${x} ${y}`);
    });
    return result.join('\r\n');
}

function toXY(angle: number): [number, number] {
    const r = angle * n;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return [x, y];
}
