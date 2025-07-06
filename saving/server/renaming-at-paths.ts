import { renameSync } from 'fs';
import { assureUndefined, fix } from '../shared/core';
import { alreadyExistsKind, cannotMoveAcrossDifferentMountedVolumesKind, destinationNonEmptyKind, errorAsBsOrNot, invalidArgumentKind, noAccessKind, notDirKind, notPermittedKind, outOfSpaceKind, pathTooLongKind, readonlyFilesystemKind, tooManyOpenFilesKind, tooManySymlinksKind, unknownCodeKind } from './file-system-error-kinds';

export function renameAtPath(sourcePath: string, targetPath: string) {
    try {
        const renamed = renameSync(sourcePath, targetPath);
        assureUndefined(renamed);
        return fix({ kind: 'renamed', sourcePath, targetPath });
    } catch (e: unknown) {
        return makeSenseOfRenameError(e);
    }
}

function makeSenseOfRenameError(something: unknown) {
    const checked = errorAsBsOrNot(something);
    if (checked.isBs) return checked;
    const { e } = checked;

    switch (e.code) {
        // Destination path already exists (on some platforms)
        case 'EEXIST': return fix({ kind: alreadyExistsKind, e });

        // Permission denied
        case 'EACCES': return fix({ kind: noAccessKind, e });

        // Operation not permitted (often on Windows — file in use or readonly)
        case 'EPERM': return fix({ kind: notPermittedKind, e });

        // Read - only file system
        case 'EROFS': return fix({ kind: readonlyFilesystemKind, e });

        // A component of the path is not a directory
        case 'ENOTDIR': return fix({ kind: notDirKind, e });

        // Path name is too long
        case 'ENAMETOOLONG': return fix({ kind: pathTooLongKind, e });

        // Too many open file descriptors(system limit reached)
        case 'EMFILE': return fix({ kind: tooManyOpenFilesKind, e });

        // Too many symbolic links in resolution
        case 'ELOOP': return fix({ kind: tooManySymlinksKind, e });

        // No space left on device(during rename if temporary writes occur)
        case 'ENOSPC': return fix({ kind: outOfSpaceKind, e });

        // Invalid argument(e.g., malformed path, on some OSes)
        case 'EINVAL': return fix({ kind: invalidArgumentKind, e });

        // Destination is a non - empty directory
        case 'ENOTEMPTY': return fix({ kind: destinationNonEmptyKind, e });






        // Resource busy (e.g., file is locked by another process)
        case 'EBUSY': return fix({ kind: 'busy', e });

        // ---------------- SPECIFIC -----------------------------

        // Source file or directory does not exist
        case 'ENOENT': return fix({ kind: 'source-does-not-exists', e });

        // Tried to overwrite a file with a directory or vice versa
        case 'EISDIR': return fix({ kind: 'overwrite-file-with-dir-or-vice-versa', e });

        // Cannot move across different mounted file systems(volumes)
        case 'EXDEV': return fix({ kind: cannotMoveAcrossDifferentMountedVolumesKind, e });

        default: return fix({ kind: unknownCodeKind, code: e.code, e });
    }
}
