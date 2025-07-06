import { fix, isNull } from '../shared/core';

export const alreadyExistsKind = 'already-exists';
export const noAccessKind = 'no-access';
export const notPermittedKind = 'not-permitted';
export const readonlyFilesystemKind = 'readonly-filesystem';
export const notDirKind = 'not-dir';
export const pathTooLongKind = 'path-too-long';
export const tooManyOpenFilesKind = 'too-many-open-files';
export const tooManySymlinksKind = 'too-many-symlinks';
export const outOfSpaceKind = 'out-of-space';
export const invalidArgumentKind = 'invalid-argument';
export const cannotMoveAcrossDifferentMountedVolumesKind = 'cannot-move-across-different-mounted-volumes';
export const unknownCodeKind = 'unknown-code';
export const destinationNonEmptyKind = 'destination-non-empty';

export function errorAsBsOrNot(e: unknown) {
    if (typeof e !== 'object') return fix({ isBs: true, kind: 'non-object', type: typeof e, e });
    if (isNull(e)) return fix({ isBs: true, kind: 'null' }); // null has type of "object"
    if (!('code' in e)) return fix({ isBs: true, kind: 'no-code', e });
    if (typeof e.code !== 'string') return fix({ isBs: true, kind: 'non-string-code', code: e.code, e });
    return fix({ isBs: false, e: e as { code: string } });
}
