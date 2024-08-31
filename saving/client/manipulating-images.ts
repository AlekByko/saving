import { makeLab, makeXyz, setLabByXyz, setXyzByRgb } from './coloring';
import { fail } from './shared/core';

const sqrt2Pi = Math.sqrt(2 * Math.PI); // do not move, since processed first come first go


/** mutates the given array */
function normalizeInPlace(values: number[]): void {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }
    for (let i = 0; i < values.length; i++) {
        values[i] /= sum;
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

export function makeMinMaxBySlidingWindow(imda: ImageData, size: number): number[] {
    if (size % 2 === 0) return fail(`Bad size ${size}. Has to be odd.`);
    const minmax: number[] = [];
    const stride = 4;
    const { data, width, height } = imda;
    const half = (size - 1) / 2;
    let i = -stride;
    for (let sy = 0; sy < height; sy++) {
        for (let sx = 0; sx < width; sx++) {
            i += stride;
            let min = data[i];
            let max = min;
            for (let ky = 0; ky < size; ky++) {
                const sky = sy - half + ky;
                if (sky < 0 || sky >= height) continue;
                for (let kx = 0; kx < size; kx++) {
                    const skx = sx - half + kx;
                    if (skx < 0 || skx >= width) continue;
                    const si = (sky * width + skx) * stride + 0;
                    const s = data[si];
                    if (s > max) max = s;
                    if (s < min) min = s;
                }
            }
            minmax.push(min)
            minmax.push(max);
        }
    }
    return minmax;
}

export function dynamicThreshold(imda: ImageData, minmax: number[]) {
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


export function averaged(imda: ImageData): ImageData {
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
    return imda;
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
export function adaptive(imda: ImageData): ImageData {
    weighted(imda);
    const { data } = imda;
    const stride = 4;
    for (let i = 0; i < data.length; i += stride) {
        const v = data[i + 0];
        void v;
    }
    return imda;
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

export function LABed(imda: ImageData): ImageData {
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
    return imda;
}
