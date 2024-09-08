import { makeLab, makeXyz, setLabByXyz, setXyzByRgb } from './coloring';
import { alertAndFail, fail, isNull } from './shared/core';

const sqrt2Pi = Math.sqrt(2 * Math.PI); // do not move, since processed first come first go


/** mutates the given array */
export function normalizeInPlace(values: number[]): void {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }
    normalizeInPlaceByTotal(values, sum);
}

export function normalizeInPlaceByTotal(values: number[], total: number): void {
    for (let i = 0; i < values.length; i++) {
        values[i] /= total;
    }
}


export function pullKernelMiddleRow(kernel: number[]): number[] {
    let size = Math.sqrt(kernel.length);
    if (size !== (~~size)) return fail(`Bad kernel length: ${kernel.length}.`);
    if (size % 2 === 0) return fail(`Bad kernel size: ${size}. Needs to be odd.`);
    const mid = (size - 1) / 2;
    const start = mid * size;
    const end = start + size;
    const row = kernel.slice(start, end);
    normalizeInPlace(row);
    return row;
}


export function makeGaussianKernel(size: number): number[] {
    if (size % 2 === 0) return fail(`Kernel size ${size} must be an odd number.`);

    const sigma = (size - 1) / 6; // magic numbers
    const kernel: number[] = [];
    const halfSize = (size - 1) / 2;
    const twoSigmaSquare = 2 * sigma * sigma;
    const normalizationFactor = 1 / (sqrt2Pi * sigma);

    for (let y = -halfSize; y <= halfSize; y++) {
        for (let x = -halfSize; x <= halfSize; x++) {
            const exponent = -(x * x + y * y) / twoSigmaSquare;
            const value = normalizationFactor * Math.exp(exponent);
            kernel.push(value);
        }
    }
    console.group(size);
    // dumpKernel(kernel, size);

    console.groupEnd()
    normalizeInPlace(kernel);
    return kernel;
};

export function dumpKernel(kernel: number[], size: number) {
    let row: number[] = [];
    console.group(size);
    for (let i = 0; i < kernel.length; i++) {
        if (row.length === size) {
            console.log(row);
            row = [];
        }
        row.push(kernel[i]);
    }
    if (row.length > 0) {
        console.log(row);
    }
    console.groupEnd();
}

export function makeMinMaxBySlidingWindow(imda: ImageData, windowSize: number): number[] {
    const minmax: number[] = [];
    foreachPxCollectInWindow({
        imda, windowSize, storage: minmax,
        makeCollected: value => ({ min: value, max: value }),
        collect: (valueAt, collected) => {
            if (valueAt > collected.max) collected.max = valueAt;
            if (valueAt < collected.min) collected.min = valueAt;
        },
        store: (collected, stored) => {
            stored.push(collected.min);
            stored.push(collected.max);
        }
    });
    return minmax;
}

export function makeMinMaxByAway(imda: ImageData, maxAway: number, minDynamicRange: number): number[] {
    const minmax: number[] = [];
    foreachPxCollectAway({
        imda, maxAway, storage: minmax,
        makeCollected: value => ({ min: value, max: value }),
        collect: (valueAt, collected) => {
            if (valueAt > collected.max) collected.max = valueAt;
            if (valueAt < collected.min) collected.min = valueAt;
        },
        tryStore: (collected, stored) => {
            const range = collected.max - collected.min;
            if (range < minDynamicRange) return false;
            stored.push(collected.min);
            stored.push(collected.max);
            return true;
        }
    });
    return minmax;
}

export function makeVoting(imda: ImageData, windowSize: number, defaulted: number): number[] {
    const voted: number[] = [];
    foreachPxCollectInWindow({
        imda, windowSize, storage: voted,
        makeCollected: () => ({ offCount: 0, onCount: 0 }),
        collect: (value, collected) => {
            value = Math.round(value);
            if (value === 0) {
                collected.offCount += 1;
                return;
            }
            if (value === 255) {
                collected.onCount += 1;
                return;
            }
        },
        store: ({ onCount, offCount }, stored) => {
            if (onCount > offCount) {
                stored.push(255);
            } else if (offCount > onCount) {
                stored.push(0);
            } else {
                stored.push(defaulted);
            }
        }
    });
    return voted;
}

type Data = Uint8ClampedArray;

export function foreachPxCollectInWindow<Storage, Collected>(
    defaults: {
        imda: ImageData,
        windowSize: number,
        storage: Storage,
        makeCollected: (value: number, data: Data, index: number) => Collected,
        collect: (value: number, collected: Collected, data: Data, index: number) => void,
        store: (collected: Collected, storage: Storage) => void,
    }
): void {
    const {
        imda, windowSize, storage, makeCollected, collect, store,
    } = defaults;
    assert(checkSlidingWindowSize(windowSize));

    const stride = 4;
    const { data, width, height } = imda;
    const half = (windowSize - 1) / 2;
    let i = -stride;
    for (let sy = 0; sy < height; sy++) {
        for (let sx = 0; sx < width; sx++) {
            i += stride;
            const collected = makeCollected(data[i], data, i);
            for (let ky = 0; ky < windowSize; ky++) {
                const sky = sy - half + ky;
                if (sky < 0 || sky >= height) continue;
                for (let kx = 0; kx < windowSize; kx++) {
                    const skx = sx - half + kx;
                    if (skx < 0 || skx >= width) continue;
                    const si = (sky * width + skx) * stride + 0;
                    const s = data[si];
                    collect(s, collected, data, i);
                }
            }
            store(collected, storage);
        }
    }
}


export function foreachPxCollectAway<Storage, Collected>(
    defaults: {
        imda: ImageData,
        maxAway: number,
        storage: Storage,
        makeCollected: (value: number, data: Data, index: number) => Collected,
        collect: (value: number, collected: Collected, data: Data, index: number) => void,
        tryStore: (collected: Collected, storage: Storage) => boolean,
    }
): void {
    const {
        imda, maxAway, storage, makeCollected, collect, tryStore,
    } = defaults;

    const stride = 4;
    const { data, width, height } = imda;
    let i = -stride;
    for (let sy = 0; sy < height; sy++) {
        for (let sx = 0; sx < width; sx++) {
            i += stride;
            const collected = makeCollected(data[i], data, i);
            let away = 0
            while (away < maxAway) {
                away += 1;
                {
                    const ky = -away; // top line
                    const sky = sy + ky;
                    // see if top line outside of image
                    if (sky >= 0 && sky < height) {
                        // top line is inside image
                        for (let kx = -away; kx <= away; kx++) {
                            const skx = sx + kx;
                            if (skx < 0 || skx >= width) continue;

                            const si = (sky * width + skx) * stride + 0;
                            const s = data[si];
                            collect(s, collected, data, i);
                        }
                    }
                }
                for (let ky = -away + 1; ky <= away - 1; ky++) {
                    const sky = sy + ky;
                    if (sky < 0 || sky >= height) continue;

                    {
                        const kx = -away; // left side
                        const skx = sx + kx;
                        if (skx >= 0 && skx < width) {

                            const si = (sky * width + skx) * stride + 0;
                            const s = data[si];
                            collect(s, collected, data, i);
                        }
                    }

                    {
                        const kx = away; // right side
                        const skx = sx + kx;
                        if (skx >= 0 && skx < width) {
                            const si = (sky * width + skx) * stride + 0;
                            const s = data[si];
                            collect(s, collected, data, i);
                        }
                    }

                }
                {
                    const ky = away; // bottom line
                    const sky = sy + ky;
                    // see if top line outside of image
                    if (sky >= 0 && sky < height) {
                        // top line is inside image
                        for (let kx = -away; kx <= away; kx++) {
                            const skx = sx + kx;
                            if (skx < 0 || skx >= width) continue;

                            const si = (sky * width + skx) * stride + 0;
                            const s = data[si];
                            collect(s, collected, data, i);
                        }
                    }
                }

                const wasStored = tryStore(collected, storage);
                if (wasStored) break;
            }
        }
    }
}

export function checkTempImda(imda: ImageData, temp: ImageData) {
    if (imda.width !== temp.width) return { code: 'temp-width-mismatches', text: `Bad width.` } as const;
    if (imda.height !== temp.height) return { code: 'temp-height-mismatches', text: `Bad height.` } as const;
    if (imda.data.length !== temp.data.length) return { code: 'temp-length-mismatches', text: `Bad length.` } as const;
    return null;
}
export function checkSlidingWindowSize(size: number) {
    if (size % 2 === 0) return { code: 'sliding-window-of-even-size', text: 'Bad size.' } as const;
    return null;
}
type Checked = null | CheckedBad;
interface CheckedBad {
    text: string;
    code: string;
}
export function assert(checked: Checked): void | never {
    if (isNull(checked)) return;
    const { code, text } = checked;
    console.log(code, text);
    debugger;
    return fail(`${code}: ${text}`);
}

export function copyImda(source: ImageData, target: ImageData): void {
    const { data: sourceData } = source;
    const { data: targetData } = target;
    for (let i = 0; i < sourceData.length; i++) {
        targetData[i] = sourceData[i];
    }
}

export function inflictDynamicThreshold(imda: ImageData, minmax: number[]) {
    const sstride = 4;
    const mstride = 2;

    const { data } = imda;

    let mi = -mstride;
    for (let si = 0; si < data.length; si += sstride) {
        mi += mstride;
        const v = data[si];
        const min = minmax[mi + 0];
        const max = minmax[mi + 1];
        const mid = (min + max) / 2;
        const cut = v > mid ? 255 : 0;
        data[si + 0] = cut;
        data[si + 1] = cut;
        data[si + 2] = cut;
        // data[si + 3] = 255;
    }
}

export function fastGauss(sourceImda: ImageData, tempImda: ImageData, kernel: number[]): void {

    if (sourceImda.width !== tempImda.width) return fail('Width of source and target does not match.');
    if (sourceImda.height !== tempImda.height) return fail('Height of source and target does not match.');

    const stride = 4;
    let { data: target } = tempImda;
    let { data: source, width: imageWidth, height: imageHeight } = sourceImda;

    const kernelHalf = (kernel.length - 1) / 2;
    for (let sy = 0; sy < imageHeight; sy++) {
        for (let sx = 0; sx < imageWidth; sx++) {
            let s = 0;
            for (let ki = 0; ki < kernel.length; ki++) {
                const k = kernel[ki];
                const skx = sx - kernelHalf + ki;

                let sk = 0; // anything outside the image is black
                if (skx >= 0 && skx < imageWidth) {
                    const ski = (sy * imageWidth + skx) * stride + 0;  // we only care about R in [R, G, B, A]
                    sk = source[ski];
                }

                s += sk * k;
            }
            s = Math.round(s);
            const si = (sy * imageWidth + sx) * stride;
            target[si + 0] = s;
            target[si + 1] = s;
            target[si + 2] = s;
            target[si + 3] = 255;
        }
    }

    let temp = source;
    source = target;
    target = temp;

    for (let sx = 0; sx < imageWidth; sx++) {
        for (let sy = 0; sy < imageHeight; sy++) {
            let s = 0;
            for (let ki = 0; ki < kernel.length; ki++) {
                const k = kernel[ki];
                const sky = sy - kernelHalf + ki;

                let sk = 0; // anything outside the image is black
                if (sky >= 0 && sky < imageHeight) {
                    const ski = (sky * imageWidth + sx) * stride + 0;  // we only care about R in [R, G, B, A]
                    sk = source[ski];
                }

                s += sk * k;
            }
            s = Math.round(s);
            const si = (sy * imageWidth + sx) * stride;
            target[si + 0] = s;
            target[si + 1] = s;
            target[si + 2] = s;
            target[si + 3] = 255;
        }
    }
}

/** assuming gray image only applying the kernel to R in [R, G, B, A] */
export function applyKernelToR(sourceImda: ImageData, targetImda: ImageData, kernel: number[], kernelSize: number): void {

    if (sourceImda.width !== targetImda.width) return fail('Width of source and target does not match.');
    if (sourceImda.height !== targetImda.height) return fail('Height of source and target does not match.');

    const stride = 4; // [R, G, B, A]
    const { data: source, width: imageWidth, height: imageHeight } = sourceImda;
    const { data: target } = targetImda;

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

                let sk = 0; // anything outside the image is black
                if (skx >= 0 && skx < imageWidth && sky >= 0 && sky < imageHeight) {
                    const ski = (sky * imageWidth + skx) * stride + 0;  // we only care about R in [R, G, B, A]
                    sk = source[ski];
                }

                s += sk * k; // <-- accumulating weighed values
            }
            s = Math.round(s);
            const si = (sy * imageWidth + sx) * stride;
            target[si + 0] = s;
            target[si + 1] = s;
            target[si + 2] = s;
            target[si + 3] = 255;
        }
    }
}


export function averaged(imda: ImageData): void {
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
export function weighted(imda: ImageData): void {
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

function make1D(length: number, fill: number): number[] {
    return Array.from({ length }).fill(fill) as number[];
}
export function makeWeighted(imda: ImageData): number[] {
    // do nothing
    const { data, width, height } = imda;

    const result = make1D(width * height, 0);
    let ri = -1;
    for (let i = 0; i < data.length; i += 4) {
        ri += 1;
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        result[ri] = y;
    }
    return result;
}

export interface Xy {
    x: number;
    y: number;
}
export function setXyAt(index: number, at: Xy, width: number, stride: number): void {
    const remainder = index % stride;
    index -= remainder;
    index /= stride;
    const x = index % width;
    index -= x;
    const y = index / width;
    at.x = x;
    at.y = y;
}

export function xyAt(x: number, y: number, width: number, stride: number): number {
    const at = (y * width + x) * stride;
    return at;
}

export function LABed(imda: ImageData): void {
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

export function makeHorzVertVector(imda: ImageData, vectorSize: number): number[] {
    const stride = 4;
    const { data, width, height } = imda;
    const sourceLength = width + height;
    const vector = make1D(vectorSize, 0);

    let si = -1; // source index

    // adding sums by row to the result vector
    for (let y = 0; y < height; y++) {
        si += 1;
        let row = 0;
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * stride;
            const d = data[i];
            row += d > 128 ? 1 : 0;
        }
        const vi = convertSourceIndexToTargetIndex(sourceLength, si, vectorSize);
        vector[vi] += row;
    }

    // adding sums by column to the result vector
    for (let x = 0; x < width; x++) {
        si += 1;
        let column = 0;
        for (let y = 0; y < height; y++) {
            const i = (y * width + x) * stride;
            const d = data[i];
            column += d > 128 ? 1 : 0;
        }
        const vi = convertSourceIndexToTargetIndex(sourceLength, si, vectorSize);
        vector[vi] += column;
    }


    return vector;
}

function convertSourceIndexToTargetIndex(sourceLength: number, sourceIndex: number, targetLength: number): number {
    const normalizedPos = sourceIndex / sourceLength; // AB: should be less than 1, from 0.0 to 0.99999
    const targetIndex = Math.floor(normalizedPos * targetLength);
    return targetIndex;
}

export function makeNormedEnergyPerSquareVector(imda: ImageData, size: number): number[] {

    const w = makeWeighted(imda);
    const { width, height } = imda;

    if (width % size !== 0) return alertAndFail(`Bad width ${width}.`);
    if (height % size !== 0) return alertAndFail(`Bad height ${height}.`);

    let squaresLength = width * height / size / size;
    let energies = make1D(squaresLength, 0);

    let si = -1;
    for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
            si += 1;
            let e = 0;
            for (let dy = 0; dy < size; dy++) {
                for (let dx = 0; dx < size; dx++) {
                    const wi = (y + dy) * width + (x + dx);
                    const d = w[wi];
                    e += d;
                }
            }
            energies[si] = e;
        }
    }
    normalizeInPlace(energies);
    return energies;
}
