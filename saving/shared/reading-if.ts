import { Choked, chokedFrom, Read, readFrom } from './reading-basics';



export function readIf<Seen, Thened, Elseed, SeenThened, SeenElsed>(
    readSee: (text: string, index: number) => Choked | Read<Seen>,
    readThen: (text: string, index: number) => Choked | Read<Thened>,
    haveThen: (seen: Seen, then: Thened) => SeenThened,
    readElse: (text: string, index: number) => Choked | Read<Elseed>,
    haveElsed: (elsed: Elseed) => SeenElsed,
    text: string, index: number,
): Choked | Read<SeenThened | SeenElsed> {
    const seen = readSee(text, index);
    if (seen.isBad) {
        const elsed = readElse(text, index);
        if (elsed.isBad) {
            return chokedFrom(elsed.index);
        } else {
            const had = haveElsed(elsed.value);
            return readFrom(elsed.index, had);
        }
    } else {
        const thened = readThen(text, seen.index);
        if (thened.isBad) {
            return chokedFrom(thened.index);
        } else {
            const had = haveThen(seen.value, thened.value);
            return readFrom(thened.index, had);
        }
    }
}

export function readIfOver<Seen, Thened, Elsed, SeenThened, SeenElsed>(
    readSee: (text: string, index: number) => Choked | Read<Seen>,
    readThen: (text: string, index: number) => Choked | Read<Thened>,
    haveThen: (seen: Seen, then: Thened) => SeenThened,
    readElse: (text: string, index: number) => Choked | Read<Elsed>,
    haveElsed: (elsed: Elsed) => SeenElsed,
) {
    function readIfUnder(text: string, index: number): Choked | Read<SeenThened | SeenElsed> {
        return readIf(readSee, readThen, haveThen, readElse, haveElsed, text, index);
    }
    readIfUnder.debugName = 'if(' + readSee.toDebugName() + ') ? (' + readThen.toDebugName() + ') : (' + readElse.toDebugName() + ')';
    return readIfUnder;
}
