import * as fs from 'fs';
import { alwaysNull, broke, fix, isDefined, isUndefined, same } from '../shared/core';
import { capturedFrom, chokedFrom, readRegOver, wholeThing } from '../shared/reading-basics';
import { readLoopOver } from '../shared/reading-loop';
import { OptionsReader } from '../shared/reading-options';
import { SequenceReader } from '../shared/reading-sequence';
import { readJsonFileAs } from './disking';

const readNonWhitespace = readRegOver(/[^\s]+/y, wholeThing);
const readCliArgValue = new OptionsReader()
    .option(readQuotedString)
    .option(readNonWhitespace).build();

const readCliArg = new SequenceReader(alwaysNull)
    .lit('--')
    .skip(readRegOver(/\s*/y, same))
    .read(readRegOver(/[\w-_\d]+/y, wholeThing), (_before, name) => ({ name }))
    .skip(readRegOver(/\s+/y, same))
    .read(readCliArgValue, ({ name, ...before }, value) => ({ ...before, [name]: value }))
    .build(x => x);

function readQuotedString(text: string, start: number) {
    let state: 'start' | 'value' = 'start';
    let index = start;
    let quote = '"';
    while (index < text.length) {
        const at = text[index];
        switch (state) {
            case 'start': {
                if (at === '"' || at === "'") {
                    quote = at;
                    state = 'value';
                    index += 1;
                    continue;
                } else {
                    return chokedFrom(index);
                }
            }
            case 'value': {
                if (at === quote) {
                    index += 1;
                    const value = text.substring(start + 1, index - 1);
                    return capturedFrom(index, value);
                } else {
                    index += 1;
                    continue;
                }
            }
            default: return broke(state);
        }
    }
    return chokedFrom(index);
}

export type CliArgs<Key extends string = string> = {
    [K in Key]: string | undefined;
}
export const readCliArgs = readLoopOver<{}, CliArgs>(
    readCliArg,
    readRegOver(/\s+/y, alwaysNull),
    x => ({ ...x }),
    (args, arg) => ({ ...args, ...arg }),
    1, 40,
);

export function ensureDir(text: string | undefined) {
    if (isUndefined(text)) return fix({ kind: 'nothing', isBad: true });
    if (!fs.existsSync(text)) return fix({ kind: 'does-not-exist', text, isBad: true });
    const stats = fs.statSync(text);
    if (!stats.isDirectory()) return fix({ kind: 'not-a-directory', isBad: true });
    return fix({ kind: 'directory', value: text, isBad: false });
}

export function ensureString(text: string | undefined) {
    if (isUndefined(text)) return fix({ isBad: true });
    return fix({ string: text, isBad: false });
}

export function ensureInteger(text: string | undefined) {
    if (isUndefined(text)) return fix({ isBad: true });
    const integer = parseInt(text, 10);
    return fix({ integer, isBad: false });
}

export const noLuckWithArgs = Symbol('no-luck-with-args');

export function henceReadingArgsOf<Key extends string>() {
    return {
        readIntegerUnto(
            argKey: Key,
            cliArgs: CliArgs<Key>,
            configValue: number | undefined,
        ): number {
            const argText = cliArgs[argKey];
            if (isDefined(argText)) {
                const value = parseInt(argText, 10);
                if (isFinite(value)) return value;
                console.log(`Bad argument: ${argKey}. Not an integer: ${argText}`);
                throw noLuckWithArgs;
            } else if (isDefined(configValue)) {
                return configValue;
            } else {
                return missingArgByeBye(argKey);
            }
        },

        readIntegerOr<Or>(
            argKey: Key,
            cliArgs: CliArgs<Key>,
            configValue: number | undefined,
            or: Or,
        ) {
            const argText = cliArgs[argKey];
            if (isDefined(argText)) {
                const value = parseInt(argText, 10);
                if (isFinite(value)) return value;
                console.log(`Bad argument: ${argKey}. Not an integer: ${argText}`);
                throw noLuckWithArgs;
            } else if (isDefined(configValue)) {
                return configValue;
            } else {
                return or;
            }
        },

        readDirOr<Or>(
            argKey: Key,
            cliArgs: CliArgs<Key>,
            configValue: string | undefined,
            or: Or,
        ): string | Or {
            const dirArg = cliArgs[argKey] ?? configValue;
            if (isDefined(dirArg)) {
                const doesExist = fs.existsSync(dirArg);
                if (doesExist) return dirArg;
                console.log(`Bad argument: ${argKey}. Dir doesn't exist: ${dirArg}`);
                throw noLuckWithArgs;
            } else {
                return or;
            }
        },

        readDirUnto(
            argKey: Key,
            cliArgs: CliArgs<Key>,
            configValue: string | undefined,
        ): string {
            const dirArg = cliArgs[argKey] ?? configValue;
            if (isDefined(dirArg)) {
                const doesExist = fs.existsSync(dirArg);
                if (doesExist) return dirArg;
                console.log(`Bad argument: ${argKey}. Dir doesn't exist: ${dirArg}`);
                throw noLuckWithArgs;
            } else {
                return missingArgByeBye<Key>(argKey);
            }
        },

        readBoolOr<Or>(
            argKey: Key,
            cliArgs: CliArgs<Key>,
            configValue: boolean | undefined,
            or: Or,
        ) {
            const argText = cliArgs[argKey];
            if (isDefined(argText)) {
                return readBoolean<Key>(argText, argKey);
            } else if (isDefined(configValue)) {
                return configValue;
            } else {
                return or;
            }
        },

        readBooleanUnto(
            argKey: Key,
            cliArgs: CliArgs<Key>,
            configValue: boolean | undefined,
        ) {
            const argText = cliArgs[argKey];
            if (isDefined(argText)) {
                return readBoolean<Key>(argText, argKey);
            } else if (isDefined(configValue)) {
                return configValue;
            } else {
                return missingArgByeBye<Key>(argKey);
            }
        },

        readStrUnto(
            argKey: Key,
            cliArgs: CliArgs<Key>,
            configValue: string | undefined,
        ): string {
            const textArg = cliArgs[argKey] ?? configValue;
            if (isUndefined(textArg)) return missingArgByeBye(argKey);
            return textArg;
        }
    };
}


function readBoolean<Key extends string>(argText: Exclude<CliArgs<Key>[Key], undefined>, argKey: Key): boolean {
    switch (argText) {
        case 'yes': case 'true': return true;
        case 'no': case 'false': return false;
        default: {
            console.log(`Bad argument: ${argKey}. Unexpected value: ${argText}`);
            throw noLuckWithArgs;
        }
    }
}

function missingArgByeBye<Key extends string>(argKey: Key): never {
    console.log(`Missing argument: ${argKey}.`);
    throw noLuckWithArgs;
}


export function readConfigOrAs<Config, Or>(configPath: string | undefined, or: Or) {
    if (isUndefined(configPath)) return or;
    const read = readJsonFileAs<Config>(configPath);
    if (read.kind === 'json') {
        const { data } = read;
        return data;
    }
    switch (read.kind) {
        case 'unable-to-read-file': {
            console.log(`Unable to read the file ${configPath}`);
            console.log(read.e);
            throw noLuckWithArgs;
        }
        case 'bad-json': {
            console.log(`Unable to parse the file ${configPath} as JSON`);
            console.log(read.e);
            throw noLuckWithArgs;
        }
        case 'file-does-not-exist': {
            console.log(`Unable to read the file ${configPath}. File doesn't exist.`);
            throw noLuckWithArgs;
        }
        default: return broke(read);
    }
}
