import { isNonNull } from '../shared/core';
import { readStringFromQueryStringOr } from './reading-query-string';

export function readAndSetAppTitle() {
    const title = readStringFromQueryStringOr(/[?&]title=([-_\w\d]+)/ig, null);
    if (isNonNull(title)) {
        document.title = title;
    }
}
