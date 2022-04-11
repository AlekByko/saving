
const startFreq = 440;

export class AudioController {

    constructor(
        private audioCtx = new AudioContext(),
    ) {
    }

    makeOscillator(i: number, a: number) {
        const { audioCtx } = this;
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.connect(audioCtx.destination);

        const freq = startFreq * Math.pow(a, i);
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        oscillator.start();
        console.log(freq);
    }
}
