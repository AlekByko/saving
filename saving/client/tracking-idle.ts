import { Timestamp, toTimestamp } from './shared/time-stamping';

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
    window.document.addEventListener('wheel', resetIdling);
    window.setInterval(() => {
        const now = toTimestamp();
        const since = now - idlingSince;
        const ago = Math.min(since, timeout);
        const readiness = ago / timeout;
        const left = timeout - ago;
        whenIdle(readiness, left);
    }, 250);
    return function idle(): void {
        const now = toTimestamp();
        idlingSince = now - timeout as Timestamp;
    };
}
