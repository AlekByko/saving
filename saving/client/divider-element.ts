import { isNull, seeIfObjectsSame } from './shared/core';

interface Holder {
    rightVerticalBarElement: HTMLElement | null;
    whenMouseDown: (e: MouseEvent) => void;
}
export function takeDividerElement(holder: Holder, element: HTMLElement | null): void {
    if (isNull(element)) {
        // coming element is null...
        if (isNull(holder.rightVerticalBarElement)) {
            // coming element is null, and existing element is null too
            // do nothing
        } else {
            // coming element is null, but existing element is non null
            holder.rightVerticalBarElement.removeEventListener('mousedown', holder.whenMouseDown);
            holder.rightVerticalBarElement = null;
        }
    } else {
        // coming element is non null...
        if (isNull(holder.rightVerticalBarElement)) {
            // coming element is non-null, but existing element is null
            // first time seeing
            holder.rightVerticalBarElement = element;
            holder.rightVerticalBarElement.addEventListener('mousedown', holder.whenMouseDown);
        } else {
            // coming element is non-null, and the existing element is non-null
            if (seeIfObjectsSame(element, holder.rightVerticalBarElement)) {
                // same element we seen before
                // do nothing
            } else {
                // somehow it's a new element
                holder.rightVerticalBarElement.removeEventListener('mousedown', holder.whenMouseDown);
                holder.rightVerticalBarElement = null;
                holder.rightVerticalBarElement = element;
                holder.rightVerticalBarElement.addEventListener('mousedown', holder.whenMouseDown);
            }
        }
    }
}
