import { LoadedImage } from './imaging';
import { hslToRgb, rgbToHex, toHue } from './shared/coloring';
import { fail, isNull } from './shared/core';

export interface CenterMass {
    x: number;
    y: number;
    m: number;
}
export function calculateColorMasses(steps: number, loaded: LoadedImage): CenterMass[] {
    const { bytes } = loaded;
    const width = loaded.image.naturalWidth;
    const height = loaded.image.naturalHeight;
    const result = new Array<CenterMass>(steps).fill({ x: 0, y: 0, m: 0 });
    const gray: CenterMass = { x: 0, y: 0, m: 0 };
    result.forEach((_, index) => {
        result[index] = { x: 0, y: 0, m: 0 };
    });
    const stride = 4;
    let index = 0;
    for (; index < bytes.length;) {
        const at = index / stride;
        const x = at % width;
        const y = (at - x) / width;
        const r = bytes[index++];
        const g = bytes[index++];
        const b = bytes[index++];
        index++; // skip alpha
        const atWeight = seeWhatWeightIndexIs(r, g, b, steps);
        const weights = atWeight < 0 ? gray : result[atWeight];
        weights.x += x;
        weights.y += y;
        weights.m += 1;
    }

    const mass = index / 4;

    // gray comes last
    result.push(gray);

    // centring
    result.forEach(weights => {
        if (weights.m > 0) {
            weights.x /= weights.m;
            weights.y /= weights.m;
        } else {
            weights.x = 0;
            weights.y = 0;
        }
    });

    // normalizing
    result.forEach(weights => {
        weights.x /= width;
        weights.y /= height;
        weights.m /= mass;
    });
    return result;
}

function seeWhatWeightIndexIs(r: number, g: number, b: number, steps: number) {
    const hue = toHue(r, g, b);
    if (isNull(hue)) return -1;
    const at = hue / 360 - (1 / steps / 2) + 1;
    const padded = Math.round(at * steps);
    const index = padded % steps;
    return index;
}

export function renderColorMasses(loaded: LoadedImage, masses: CenterMass[]) {
    const { context, image } = loaded;
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const mass = width * height;
    const centerCount = masses.length - 1; // <-- skipping the gray, which comes last
    for (let index = 0; index < centerCount; index++) {
        const center = masses[index];
        const x = Math.floor(center.x * width);
        const y = Math.floor(center.y * height);
        const area = center.m * mass;
        const rad = Math.sqrt(area / Math.PI);
        const h = index / centerCount;
        const [r, g, b] = hslToRgb(h, 1, 1);
        const color = rgbToHex(r, g, b);
        console.log(h, r, g, b, color);
        context.beginPath();
        context.arc(x, y, rad, 0, Math.PI * 2);
        context.fillStyle = color + '80';
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = 'white';
        context.stroke();
    }
}

export function calculateColorMassesDistance(
    oneMasses: CenterMass[],
    anotherMasses: CenterMass[],
): number {
    if (oneMasses.length !== anotherMasses.length) return fail('Bad masses. Unable to get distance.');
    let sum = 0;
    for (let index = 0; index < oneMasses.length; index ++) {
        const one = oneMasses[index];
        const another = anotherMasses[index];
        const dx = one.x - another.x;
        const dy = one.y - another.y;
        const dm = one.m - another.m;
        sum += dx * dx + dy * dy + dm * dm;
    }
    const result = Math.sqrt(sum);
    return result;
}
