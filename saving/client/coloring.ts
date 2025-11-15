export type Xyz = [number, number, number] & As<'xyz'>;

export function makeXyz(): Xyz {
    return new Float32Array() as any;
}

export type Lab = [number, number, number] & As<'lab'>;

export function makeLab(): Lab {
    return new Float32Array(3) as any;
}

function xyzetting(x: number): number {
    x = x / 255;
    x = x > 0.04045
        ? Math.pow(((x + 0.055) / 1.055), 2.4)
        : x / 12.92;
    x = x * 100;
    return x;
}

export function setXyzByRgb(r: number, g: number, b: number, xyz: Xyz): void {
    const var_R = xyzetting(r);
    const var_G = xyzetting(g);
    const var_B = xyzetting(b);

    // Observer. = 2°, Illuminant = D65
    const x = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805;
    const y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722;
    const z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505;
    xyz[0] = x;
    xyz[1] = y;
    xyz[2] = z;
}


const ref_X = 95.047;
const ref_Y = 100.000;
const ref_Z = 108.883;

export function setLabByXyz([x, y, z]: Xyz, lab: Lab): void {
    const [var_X, var_Y, var_Z] = [x / ref_X, y / ref_Y, z / ref_Z]
        .map(a => a > 0.008856
            ? Math.pow(a, 1 / 3)
            : (7.787 * a) + (16 / 116));

    const CIE_L = (116 * var_Y) - 16;
    const CIE_a = 500 * (var_X - var_Y);
    const CIE_b = 200 * (var_Y - var_Z);
    lab[0] = CIE_L;
    lab[1] = CIE_a;
    lab[2] = CIE_b;
}
