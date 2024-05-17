import { toTimestamp } from './shared/time-stamping';

export function startTrackingIdle(
    timeout: number,
    whenIdle: (
        /** Percent: 0.0 - 1.0 */
        readiness: number,
        /** Milliseconds */
        left: number,
    ) => void
) {
    let idlingSince = toTimestamp();
    const resetIdling = () => {
        idlingSince = toTimestamp();
    };
    window.document.addEventListener('mousedown', resetIdling); // mouse held still can still be clicked
    window.document.addEventListener('mousemove', resetIdling);
    window.document.addEventListener('keydown', resetIdling);
    window.setInterval(() => {
        const now = toTimestamp();
        const since = now - idlingSince;
        const ago = Math.min(since, timeout);
        const ready = ago / timeout;
        const left = timeout - ago;
        whenIdle(ready, left);
    }, 250);
}
