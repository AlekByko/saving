import { RGBtoXYZ, XYZtoLAB } from './coloring';
import { broke } from './shared/core';

export function pickHow(mode: Mode) {
    switch (mode) {
        case 'nothing': return nothing;
        case 'averaged': return averaged;
        case 'weighted': return weighted;
        case 'LABed': return LABed;
        case 'adaptive': return adaptive;
        default: return broke(mode);
    }
}
function nothing(_: ImageData): void {
    // do nothing
}
function averaged(imda: ImageData): void {
    // do nothing
    const { data } = imda;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        // const a = data[i + 3];
        const y = (r + g + b) / 3;
        data[i + 0] = y;
        data[i + 1] = y;
        data[i + 2] = y;
    }
}
function weighted(imda: ImageData): void {
    // do nothing
    const { data } = imda;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        // const a = data[i + 3];
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i + 0] = y;
        data[i + 1] = y;
        data[i + 2] = y;
    }
}
function adaptive(imda: ImageData): void {
    weighted(imda);
    const { data } = imda;
    const stride = 4;
    for (let i = 0; i < data.length; i += stride) {
        const v = data[i + 0];
        void v;
    }
}
interface Xy {
    x: number;
    y: number;
}
function setXyAt(index: number, at: Xy, width: number, stride: number): void {
    const remainder = index % stride;
    index -= remainder;
    index /= stride;
    const x = index % width;
    index -= x;
    const y = index / width;
    at.x = x;
    at.y = y;
}
void setXyAt;
function xyAt(x: number, y: number, width: number, stride: number): number {
    const at = (y * width + x) * stride;
    return at;
}
void xyAt;
function LABed(imda: ImageData): void {
    // do nothing
    const { data } = imda;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];

        const xyz = RGBtoXYZ(r, g, b);
        let [l, _a, _b] = XYZtoLAB(xyz);
        l = Math.round(l / 100 * 255);
        data[i + 0] = l;
        data[i + 1] = l;
        data[i + 2] = l;
    }
}
const allModes = ['nothing', 'averaged', 'weighted', 'LABed', 'adaptive'] as const;
export type Mode = typeof allModes[number];
export const modes = [...allModes];
