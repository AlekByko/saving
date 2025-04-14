
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
