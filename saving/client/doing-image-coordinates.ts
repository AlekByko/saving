import { compareNumbers, fail, sureNonNull } from '../shared/core';

/**
 * Cuts out an ImDa (ImageData) from given 2d canvas context using normalized coordinates and normalized size:
 * - `n...` stands for normalized coordinates
 * - `p...` stands for coordinates in pixel space
 *
 * !!! WARNING !!!
 * THIS DOES NOT GUARANTEE GAPS-FREE OR OVERLAPS-FREE TILES WHEN TILING THE ENTIRE IMAGE
 *
 * HINT: you should work in pixel space instead
 */
export function getImdaFromNormedBox__UNSAFE(
    context: CanvasRenderingContext2D,
    /** has to be [0; 1) */
    nx: number,
    /** has to be [0; 1) */
    ny: number,
    /** has to be [0: 1] */
    nw: number,
    /** has to be [0: 1] */
    nh: number,
    totalWidth: number, totalHeight: number
) {

    const px = Math.floor(nx * totalWidth);
    const py = Math.floor(ny * totalHeight);
    const pxw = Math.ceil((nx + nw) * totalWidth);
    const pyh = Math.ceil((ny + nh) * totalHeight);
    const pw = pxw - px;
    const ph = pyh - py;
    const imda = context.getImageData(px, py, pw, ph);
    return imda;
}


export function chopDistancePxSharp(distance: number, numberOfTiles: number) {

    const boundaries: number[] = [];
    for (let i = 0; i <= numberOfTiles; i++) {
        boundaries.push(Math.round(i * distance / numberOfTiles));
    }

    const tiles: [x: number, width: number][] = [];
    for (let i = 0; i < numberOfTiles; i++) {
        const start = boundaries[i];
        const end = boundaries[i + 1];
        const width = end - start;
        tiles.push([start, width]);
    }

    return tiles;
}

export function zipToGrid<T, U, V>(
    one: T[],
    another: U[],
    zip: (one: T, another: U) => V
): V[][] {
    const result: V[][] = [];

    for (let i = 0; i < one.length; i++) {
        const row: V[] = [];

        for (let j = 0; j < another.length; j++) {
            const zipped = zip(one[i], another[j]);
            row.push(zipped);
        }

        result.push(row);
    }

    return result;
}

export function tileRectPxSharp(
    width: number, height: number,
    numberOfHorizontalTiles: number, numberOfVerticalTiles: number,
): Box[][] {
    const horizontal = chopDistancePxSharp(width, numberOfHorizontalTiles);
    const vertical = chopDistancePxSharp(height, numberOfVerticalTiles);
    const zipped = zipToGrid(horizontal, vertical, (
        [x, width],
        [y, height],
    ) => {
        return { x, y, width, height };
    });
    return zipped;
}

export function averageColorInTile(
    imda: ImageData,
    sx: number, sy: number,
    sw: number, sh: number,
): Color | undefined {
    if (sx < 0) return;
    if (sy < 0) return;
    if (sw < 1) return;
    if (sh < 1) return;
    const { data, width, height } = imda;
    if (sx + sw > width) return;
    if (sy + sh > height) return;
    const stride = 4;
    let total = 0;
    let tr = 0;
    let tg = 0;
    let tb = 0;
    for (let dy = 0; dy < sh; dy++) {
        const y = dy + sy;
        const ixs = y * width + sx;
        for (let dx = 0; dx < sw; dx++) {
            const ix = ixs + dx;
            // const x = dx + sx;
            let at = ix * stride;
            total += 1;
            const r = data[at++];
            const g = data[at++];
            const b = data[at++];
            tr += r;
            tg += g;
            tb += b;
        }
    }
    tr = Math.round(tr / total);
    tg = Math.round(tg / total);
    tb = Math.round(tb / total);
    return [tr, tg, tb];
}

export interface Box { x: number; y: number; width: number; height: number; }
export type Color = [r: number, g: number, b: number];

/** Given a rectangular gird of tiles. Make all transitions between adjacent tiles.
 * Directions of transitions to be collected:
 *
 *      - horizontal: current tile -> next tile to the right
 *      - vertical: current tile -> tile right below
 *
 * Basically it's all borders between tiles as [V, V] counted EXATLY ONE TIME between EACH 2 ADJECENT TILES.
 */
export function makeHvTileTransitionsOfTileGrid<Tile, Value>(
    grid: Tile[][],
    valueOf: (tile: Tile) => Value,
): [Value, Value][] {
    const transitions: [Value, Value][] = [];
    for (let i = 0; i < grid.length - 1; i++) {
        const row = grid[i];
        for (let j = 0; j < row.length - 1; j++) {
            const at = valueOf(row[j]);
            const right = valueOf(row[j + 1]);
            const below = valueOf(grid[i + 1][j]);
            transitions.push([at, right]);
            transitions.push([at, below]);
        }
    }
    return transitions;
}




function getImagePixels(image: HTMLImageElement, width: number, height: number) {
    const thumbnail = document.createElement('canvas');
    const thumbnailContext = thumbnail.getContext('2d', {
        willReadFrequently: true,
        alpha: false,
    });
    sureNonNull(thumbnailContext, 'Thumbnail context');
    thumbnail.width = width;
    thumbnail.height = height;
    thumbnailContext.drawImage(image, 0, 0, width, height);
    const data = thumbnailContext.getImageData(0, 0, width, height).data;
    const pixels = new Array(width * height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        pixels[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return pixels;
}


// Generate pHash: 8x8 grayscale, DCT, binary hash
export function computePHash(image: HTMLImageElement) {
    const width = 16;
    const height = 16;

    // Step 1: Get 8x8 grayscale pixels
    const pixels = getImagePixels(image, width, height);

    // Step 2: Apply DCT
    const dct = dct2d(pixels, width, height);

    // using top-left (low frequencies), compute median
    const values = collectInZigZag(dct, width, width / 2);
    const sorted = [...values].sort(compareNumbers);
    const midIndex = Math.floor(values.length / 2);
    const median = sorted[midIndex]; // aporox median

    let phash = '';
    for (let i = 0; i < values.length; i++) {
        phash += values[i] > median ? '1' : '0';
    }
    return phash;
}

function dct2d(pixels: number[], width: number, height: number) {
    const result = new Array(width * height);
    const scale = Math.sqrt(2 / width);
    const sqrt2 = Math.sqrt(2);
    for (let u = 0; u < height; u++) {
        for (let v = 0; v < width; v++) {
            let sum = 0;
            for (let x = 0; x < height; x++) {
                for (let y = 0; y < width; y++) {
                    const pixel = pixels[x * width + y];
                    const cu = u === 0 ? 1 / sqrt2 : 1;
                    const cv = v === 0 ? 1 / sqrt2 : 1;
                    sum += pixel * cu * cv * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * width)) * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * height));
                }
            }
            result[u * width + v] = scale * sum;
        }
    }
    return result;
}

export function hammingDistance<Or>(hash1: string, hash2: string, or: Or) {
    if (hash1.length !== hash2.length) return or;
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) distance++;
    }
    return distance;
}



export function collectInZigZag<T>(values: T[], width: number, size: number) {
    if (size > width) return fail(`Size ${size} greater than width ${width}.`);
    if (values.length % width !== 0) return fail(`Width ${width} is not a factor of number of elements ${values.length}.`);
    const result: T[] = [];
    for (let p = 0; p < size; p++) {
        let isIt = p % 2 === 0;
        let sx = isIt ? 1 : -1;
        let sy = isIt ? -1 : 1;
        let x = isIt ? 0 : p;
        let y = isIt ? p : 0;
        for (let q = 0; q <= p; q++) {
            const i = y * width + x;
            const value = values[i];
            result.push(value);
            x += sx;
            y += sy;
        }
    }
    return result;
}

if (window.sandbox === 'doing-image-coordinates') {
    const zizzed = collectInZigZag([
        0, 1, 5, 6,
        2, 4, 7, 12,
        3, 8, 11, 13,
        9, 10, 14, 15,
    ], 4, 4);
    console.log(zizzed);
}
