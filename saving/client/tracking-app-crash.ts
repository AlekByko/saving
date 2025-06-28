import { formatElapsedToMinutes, toElapsedFromMiliseconds } from '../shared/time-elapsed';
import { toTimestamp } from '../shared/time-stamping';

export function enableAppCrashTracking(window: Window): Act {
    const whenError = (e: ErrorEvent) => {
        debugger;
        const happendAt = toTimestamp();
        alert(`!!! UNHANDLED ERROR !!! CHECK THE CONSOLE !!! `);
        const now = toTimestamp();
        console.log(e);
        console.trace();
        const ago = now - happendAt;
        const elapsed = toElapsedFromMiliseconds(ago);
        const elapsedText = formatElapsedToMinutes(elapsed);
        console.log(`Happend at ${new Date(happendAt).toLocaleString()} it was ago: ${elapsedText}`);
        try {
            const { message, source, lineno, colno, error, stack } = e.error;
            console.log({ message, source, lineno, colno, error, stack });
        }
        finally { }
    };
    window.addEventListener('error', whenError);
    return () => {
        window.removeEventListener('error', whenError);
    }
}
