import { fail } from './core';
import { Choked, firstGoes, Read, readFrom, readLitOver, readOver } from './reading-basics';

export class SequenceReader<OlderResult> {
    constructor(
        private toResult: () => OlderResult,
        private all = [] as {
            read: (text: string, index: number) => Choked | Read<unknown>;
            add: (older: any, value: any) => unknown;
        }[],
    ) {

    }

    read<Value, NewerResult>(
        read: (text: string, index: number) => Choked | Read<Value>,
        add: (result: OlderResult, value: Value) => NewerResult,
    ): SequenceReader<NewerResult> {
        this.all.push({ read, add });
        return this as any;
    }

    lit<Literal extends string>(literal: Literal): SequenceReader<OlderResult> {
        const read = readLitOver(literal);
        this.all.push({ read, add: firstGoes });
        return this as any;
    }

    skip<Value>(
        read: (text: string, index: number) => Choked | Read<Value>,
    ): SequenceReader<OlderResult> {
        this.all.push({ read, add: firstGoes });
        return this as any;
    }

    parse<Value, Parse, NewerResult>(
        read: (text: string, index: number, parse: Parse) => Choked | Read<Value>,
        parse: Parse,
        add: (result: OlderResult, value: Value) => NewerResult,
    ): SequenceReader<NewerResult> {
        this.all.push({ read: readOver(read, parse), add })
        return this as any;
    }

    build<FinalResult>(finish: (older: OlderResult) => FinalResult) {
        const { all, toResult } = this;
        if (all.length < 1) return fail('No readers');
        function readUnder(text: string, index: number): Choked | Read<FinalResult> {
            let older = toResult() as unknown;
            for (let i = 0; i < all.length; i++) {
                const { read, add } = all[i];
                const newer = read(text, index);
                // console.log(index, newer);
                if (newer.isBad) {
                    // console.warn(older);
                    return newer;
                }
                older = add(older, newer.value);
                index = newer.index;
            }
            const final = finish(older as any);
            // console.log(final);
            return readFrom(index, final);
        };
        readUnder.debugName = 'seq(' + all.map(x => x.read.toDebugName()).join(' - ') + ')'
        return readUnder;
    }
}
