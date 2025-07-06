import { mkdirSync } from 'fs';
import { assureUndefined, fix } from '../shared/core';
import { alreadyExistsKind, destinationNonEmptyKind, errorAsBsOrNot, invalidArgumentKind, noAccessKind, notDirKind, notPermittedKind, outOfSpaceKind, pathTooLongKind, readonlyFilesystemKind, tooManyOpenFilesKind, tooManySymlinksKind, unknownCodeKind } from './file-system-error-kinds';

export function mkdirAtPath(path: string, options?: { recursive?: boolean }) {
    try {
        const made = mkdirSync(path, options);
        assureUndefined(made);
        return fix({ kind: 'made', path });
    } catch (e: unknown) {
        return makeSenseOfMkdirError(e);
    }
}

function makeSenseOfMkdirError(something: unknown) {
    const bsOrNot = errorAsBsOrNot(something);
    if (bsOrNot.isBs) return bsOrNot;
    const { e } = bsOrNot;

    switch (e.code) {
        // Path already exists, and either not a dir or recursive: false
        case 'EEXIST': return fix({ kind: alreadyExistsKind, e });

        // Permission denied
        case 'EACCES': return fix({ kind: noAccessKind, e });

        // Operation not permitted
        case 'EPERM': return fix({ kind: notPermittedKind, e });

        // Read-only file system
        case 'EROFS': return fix({ kind: readonlyFilesystemKind, e });

        // A component of the path is not a directory
        case 'ENOTDIR': return fix({ kind: notDirKind, e });

        // Path is too long
        case 'ENAMETOOLONG': return fix({ kind: pathTooLongKind, e });

        // Too many open file descriptors
        case 'EMFILE': return fix({ kind: tooManyOpenFilesKind, e });

        // Too many symbolic links
        case 'ELOOP': return fix({ kind: tooManySymlinksKind, e });

        // No space left on device
        case 'ENOSPC': return fix({ kind: outOfSpaceKind, e });

        // Invalid argument
        case 'EINVAL': return fix({ kind: invalidArgumentKind, e });

        case 'ENOTEMPTY': return fix({ kind: destinationNonEmptyKind, e });


        // -------------------- SPECIFIC ----------------------------------

        // A component of the path does not exist (and recursive is false)
        case 'ENOENT': return fix({ kind: 'parent-does-not-exist', e });

        // Target is a directory but used incorrectly
        case 'EISDIR': return fix({ kind: 'target-is-dir-already', e });


        default: return fix({ kind: unknownCodeKind, subkind: 'unknown-code', code: e.code, e });
    }
}
