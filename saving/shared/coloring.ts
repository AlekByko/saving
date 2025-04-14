import { padZeroText } from './texting';

export function rgbToHueOnly(r: number, g: number, b: number): number | null {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (max == min) return null;

    let h = 0;
    const d = max - min;
    switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    return h;
}

export function hslToRgb(h: number, s: number, l: number) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p: number, q: number, t: number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [round(r, 255), round(g, 255), round(b, 255)];
}

function round(value: number, size: number): number {
    const almost = Math.floor(value * (size + 1));
    return Math.min(almost, size);
}

export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + padZeroText(2, r.toString(16)) + padZeroText(2, g.toString(16)) + padZeroText(2, b.toString(16));
}

