import { renameSync } from 'fs';
import { assureUndefined, fix, isNull } from '../shared/core';

export function renameAtPath(sourcePath: string, targetPath: string) {
    try {
        const renamed = renameSync(sourcePath, targetPath);
        assureUndefined(renamed);
        return fix({ kind: 'renamed', sourcePath, targetPath });
    } catch (e: unknown) {
        return makeSenseOfError(e);
    }
}

function makeSenseOfError(e: unknown) {
    if (typeof e !== 'object') return fix({ kind: 'non-object', type: typeof e, e });
    if (isNull(e)) return fix({ kind: 'null', subkind: 'null' }); // null has type of "object"
    if (!('code' in e)) return fix({ kind: 'no-code', e });
    if (typeof e.code !== 'string') return fix({ kind: 'non-string-code', code: e.code, e });

    switch (e.code) {
        // Resource busy (e.g., file is locked by another process)
        case 'EBUSY': return fix({ kind: 'busy', e });

        // Operation not permitted (often on Windows — file in use or readonly)
        case 'EPERM': return fix({ kind: 'not-permitted', e });

        // Source file or directory does not exist
        case 'ENOENT': return fix({ kind: 'source-does-not-exists', e });

        // Destination path already exists (on some platforms)
        case 'EEXIST': return fix({ kind: 'destination-exists', e });

        // Permission denied
        case 'EACCES': return fix({ kind: 'permission-denied', e });

        // No space left on device(during rename if temporary writes occur)
        case 'ENOSPC': return fix({ kind: 'out-of-space', e });

        // Destination is a non - empty directory
        case 'ENOTEMPTY': return fix({ kind: 'destination-non-empty', e });

        // Cannot move across different mounted file systems(volumes)
        case 'EXDEV': return fix({ kind: 'cannot-move-across-different-mounted-volumes', e });

        // Invalid argument(e.g., malformed path, on some OSes)
        case 'EINVAL': return fix({ kind: 'invalid-argument', e });

        // A component of the path is not a directory
        case 'ENOTDIR': return fix({ kind: 'not-dir', e });

        // Tried to overwrite a file with a directory or vice versa
        case 'EISDIR': return fix({ kind: 'overwrite-file-with-dir-or-vice-versa', e });

        // Read - only file system
        case 'EROFS': return fix({ kind: 'readonly-file-system', e });

        // Too many open file descriptors(system limit reached)
        case 'EMFILE': return fix({ kind: 'too-many-file-descriptors', e });

        // Path name is too long
        case 'ENAMETOOLONG': return fix({ kind: 'path-too-long', e });

        // Too many symbolic links in resolution
        case 'ELOOP': return fix({ kind: 'too-many-symbolic-links', e });

        default: return fix({ kind: 'unknown-code', code: e.code, e });
    }
}
