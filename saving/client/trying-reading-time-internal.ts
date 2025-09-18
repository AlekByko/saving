import { alwaysNull } from '../shared/core';
import { parseTimeInternalOr } from '../shared/reading-time-interval';

if (window.sandbox === 'trying-reading-time-internal') {
    console.log(parseTimeInternalOr(`1d 2h 3m 4s`, alwaysNull));
    console.log(parseTimeInternalOr(`1d`, alwaysNull));
    console.log(parseTimeInternalOr(`2h 3m 4s`, alwaysNull));
    console.log(parseTimeInternalOr(`2h 3m`, alwaysNull));
    console.log(parseTimeInternalOr(`2h`, alwaysNull));
    console.log(parseTimeInternalOr(`3m`, alwaysNull));
    console.log(parseTimeInternalOr(`3m 4s`, alwaysNull));
    console.log(parseTimeInternalOr(`4s`, alwaysNull));
}
