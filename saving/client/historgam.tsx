import * as React from 'react';
import { toLoadedImageBytes } from './imaging';
import { isNull } from './shared/core';

export interface HistogrammerProps {
}

const BYTE_CAPACITY = 256;

export interface Histogram {
    rs: number[];
    gs: number[];
    bs: number[];
    total: number;
}

function calculateVectorDistanceSum(one: number[], another: number[]): number {
    let sum = 0;
    for (let index = 0; index < one.length; index++) {
        const a = one[index];
        const b = another[index];
        const c = a - b;
        const d = c * c;
        sum += d;
    }
    return sum;
}
export function calculateHistogramDistance(one: Histogram, another: Histogram): number {
    const rs = calculateVectorDistanceSum(one.rs, another.rs);
    const gs = calculateVectorDistanceSum(one.gs, another.gs);
    const bs = calculateVectorDistanceSum(one.bs, another.bs);
    const sum = rs + gs + bs;
    const result = Math.sqrt(sum);
    return result;
}


export function calculateHistogramByImageData(data: Uint8ClampedArray, size: number) {
    const { length } = data;

    const rs: number[] = new Array(size).fill(0);
    const gs: number[] = new Array(size).fill(0);
    const bs: number[] = new Array(size).fill(0);

    let index = 0;
    const k = size / BYTE_CAPACITY;
    while (index < length) {

        const r = data[index++];
        rs[Math.trunc(r * k)] += 1;

        const g = data[index++];
        gs[Math.trunc(g * k)] += 1;

        const b = data[index++];
        bs[Math.trunc(b * k)] += 1;

        index += 5; // <-- for optimization, skipping alpha of this pixel and whole next pixel
    }
    let total = length - length / 4;
    total /= 2;

    const histogram: Histogram = { rs, gs, bs, total };
    normalizeHistogram(histogram);
    return histogram;
}

function normalizeVector(vec: number[], total: number): void {
    for (let index = vec.length - 1; index >= 0; index --) {
        vec[index] /= total;
    }
}

function normalizeHistogram(histo: Histogram): void {
    const { total } = histo;
    normalizeVector(histo.rs, total);
    normalizeVector(histo.gs, total);
    normalizeVector(histo.bs, total);
}

const defaultSize = 50;
const opacity = 0.85;
const red = `rgba(255, 0, 0, ${opacity})`;
const green = `rgba(0, 255, 0, ${opacity})`;
const blue = `rgba(0, 0, 255, ${opacity})`;

export class Histogrammer extends React.Component<HistogrammerProps> {

    private imageElement: HTMLImageElement | null = null;
    private canvasElement: HTMLCanvasElement | null = null;

    componentDidMount() {
        const { imageElement, canvasElement } = this;
        if (isNull(imageElement)) return;
        if (isNull(canvasElement)) return;
        imageElement.onload = () => {
            const data = toLoadedImageBytes(canvasElement, imageElement);
            const histo = calculateHistogramByImageData(data, defaultSize);
            renderHistogram(canvasElement, histo);
        };
    }

    render() {
        return <div>
            <img ref={self => this.imageElement = self}
                className="off" src='sample-02.jpg' />
            <canvas ref={self => this.canvasElement = self}
                className="off" style={{ border: 'solid 1px black' }} width={200} height={200} />
        </div>;
    }
}

function renderHistogram(canvas: HTMLCanvasElement, histo: Histogram) {
    const ctx = canvas.getContext('2d')!;
    const size = canvas.width / histo.rs.length;
    renderHistogramChannel(histo.rs, ctx, red, size, canvas);
    renderHistogramChannel(histo.gs, ctx, green, size, canvas);
    renderHistogramChannel(histo.bs, ctx, blue, size, canvas);
}

function renderHistogramChannel(
    values: number[],
    ctx: CanvasRenderingContext2D,
    style: string,
    size: number,
    canvas: HTMLCanvasElement
): void {
    ctx.beginPath();
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = style;
    ctx.moveTo(0, -canvas.height);
    values.forEach((value, index) => {
        const x = index * size + size / 2;
        const y = canvas.height - (canvas.height * value * defaultSize / 10 /*<-- super magic number! */);
        if (index > 0) {
            ctx.lineTo(x, y);
        } else {
            ctx.moveTo(x, y);
        }
    });
    ctx.stroke();
}
