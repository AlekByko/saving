const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const A4 = 440;

function frequencyToNote(freq: number) {
    const noteNumber = Math.round(12 * Math.log2(freq / A4)) + 69;
    const noteIndex = noteNumber % 12;
    const octave = Math.floor(noteNumber / 12) - 1;
    return `${noteNames[noteIndex]}${octave}`;
}

function autoCorrelate(buffer: Float32Array<ArrayBuffer>, sampleRate: number) {
    const SIZE = buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
        const val = buffer[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // silence

    let lastCorrelation = 1;
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
        let correlation = 0;
        for (let i = 0; i < MAX_SAMPLES; i++) {
            correlation += Math.abs(buffer[i] - buffer[i + offset]);
        }
        correlation = 1 - (correlation / MAX_SAMPLES);
        if (correlation > 0.9 && correlation > lastCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
        lastCorrelation = correlation;
    }

    if (bestCorrelation > 0.9 && bestOffset !== -1) {
        let frequency = sampleRate / bestOffset;

        // 👇 Try multiplying if pitch is suspiciously low
        while (frequency < 80) {
            frequency *= 2;
        }

        return frequency;
    }

    return -1;
}
export async function willStart(element: HTMLElement) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new window.AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const buffer = new Float32Array(analyser.fftSize);

        function update() {
            analyser.getFloatTimeDomainData(buffer);
            const pitch = autoCorrelate(buffer, audioContext.sampleRate);

            if (pitch !== -1 && pitch >= 80 && pitch <= 1200) {
                const note = frequencyToNote(pitch);
                const x = `${note} ${pitch.toFixed(2)} Hz`;
                element.textContent = x;
            } else {
                element.textContent = 'SHIT';
            }

            requestAnimationFrame(update);
        }

        update();
    } catch (err: any) {
        alert("Microphone access failed:\n" + err.message);
        console.error(err);
    }
}
