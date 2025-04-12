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


export function chopDiscreteDistanceIntoPixelPerfectChunks(distance: number, numberOfTiles: number) {

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


