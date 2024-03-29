import { toTimestamp } from './shared/time-stamping';

export function startTrackingIdle(timeout: number, whenIdle: () => void) {
    let idlingSince = toTimestamp();
    window.document.addEventListener('mousemove', () => {
        idlingSince = toTimestamp();
    });
    window.document.addEventListener('keydown', () => {
        idlingSince = toTimestamp();
    });
    window.setInterval(() => {
        const now = toTimestamp();
        const ago = now - idlingSince;
        if (ago > timeout) {
            whenIdle();
        }
    }, 500);
}
