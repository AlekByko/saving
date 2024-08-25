import { makeLab, makeXyz, setLabByXyz, setXyzByRgb } from './coloring';
import { broke } from './shared/core';


export type ProcessImageData = (imda: ImageData, imageWidth: number) => void;

export function pickHow(mode: Mode) {
    switch (mode) {
        case 'nothing': return nothing;
        case 'gauss': return gauss;
        case 'averaged': return averaged;
        case 'weighted': return weighted;
        case 'LABed': return LABed;
        case 'adaptive': return adaptive;
        default: return broke(mode);
    }
}

const gauss7x7 = [
    0.0007, 0.0018, 0.0043, 0.0077, 0.0043, 0.0018, 0.0007,
    0.0018, 0.0046, 0.0109, 0.0191, 0.0109, 0.0046, 0.0018,
    0.0043, 0.0109, 0.0256, 0.0440, 0.0256, 0.0109, 0.0043,
    0.0077, 0.0191, 0.0440, 0.0764, 0.0440, 0.0191, 0.0077,
    0.0043, 0.0109, 0.0256, 0.0440, 0.0256, 0.0109, 0.0043,
    0.0018, 0.0046, 0.0109, 0.0191, 0.0109, 0.0046, 0.0018,
    0.0007, 0.0018, 0.0043, 0.0077, 0.0043, 0.0018, 0.0007,
  ];

function gauss(imda: ImageData, imageWidth: number): void {
    weighted(imda);
    gaussRGray(imda, 4, imageWidth, gauss7x7, 7);
}

function gaussRGray(imda: ImageData, stride: number, imageWidth: number, kernel: number[], kernelSize: number): void {
    const { data } = imda;
    const imageHeight = data.length / stride / imageWidth;
    const kernelHalf = (kernelSize - 1) / 2;
    for (let sy = 0; sy < imageHeight; sy++) {
        for (let sx = 0; sx < imageWidth; sx++) {
            let s = 0;
            for (let ki = 0; ki < kernel.length; ki++) {
                /** below:
                    k - kernel value
                    ki - kernel index
                    kx, ky - kernel x, y
                    skx, sky - image x, y of kernel x, y
                    ski - image index at kernel x,y
                    sk - image value at kernel x,y
                 */
                const k = kernel[ki];
                const kx = ki % kernelSize;
                const ky = (ki - kx) / kernelSize;
                const skx = sx - kernelHalf + kx;
                const sky = sy - kernelHalf + ky;
                let ski = (sky * imageWidth + skx) * stride + 1;  // we only care about R in [R, G, B, A]
                let sk = 0;
                if (ski >= 0 && ski < data.length) {
                    sk = data[ski];
                }
                s += sk * k; // <-- accumulating weighed values
            }
            s = Math.round(s);
            const si = (sy * imageWidth + sx) * stride;
            data[si + 0] = s;
            data[si + 1] = s;
            data[si + 2] = s;
            // data[si + 3] = 0;
        }
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
    const lab = makeLab();
    const xyz = makeXyz();
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];

        setXyzByRgb(r, g, b, xyz);
        setLabByXyz(xyz, lab);

        let [l] = lab;
        l = Math.round(l / 100 * 255);
        data[i + 0] = l;
        data[i + 1] = l;
        data[i + 2] = l;
    }
}
const allModes = ['nothing', 'gauss', 'averaged', 'weighted', 'LABed', 'adaptive'] as const;
export type Mode = typeof allModes[number];
export const modes = [...allModes];
