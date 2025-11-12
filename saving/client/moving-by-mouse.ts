import { ignore, isNull } from '../shared/core';

export function enableMouseMoving(
    handleElement: HTMLElement | null,
    rootElementOrNull: HTMLElement | null,
    startAt: Point,
): () => void {

    if (isNull(handleElement) || isNull(rootElementOrNull)) return ignore;
    const rootElement = rootElementOrNull;
    rootElement.style.left = startAt.x + 'px';
    rootElement.style.top = startAt.y + 'px';
    let startX = 0;
    let startY = 0;
    let left = 0;
    let top = 0;



    function whenMouseUp(_e: MouseEvent): void {
        document.removeEventListener('mousemove', whenMouseMove);
        document.removeEventListener('mouseup', whenMouseUp);
    }

    function whenMouseMove(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const dx = e.pageX - startX;
        const dy = e.pageY - startY;
        rootElement.style.left = (left + dx) + 'px';
        rootElement.style.top = (top + dy) + 'px';
    }


    function whenMouseDown(e: MouseEvent): void {

        if (e.currentTarget !== e.target) return; // only allow moving if clicked on the element and not on any of its children

        startX = e.pageX;
        startY = e.pageY;
        const rect = rootElement.getBoundingClientRect();
        left = rect.left;
        top = rect.top;

        document.addEventListener('mousemove', whenMouseMove);
        document.addEventListener('mouseup', whenMouseUp);
    }

    handleElement.addEventListener('mousedown', whenMouseDown);

    return function stopListening(): void {
        handleElement.removeEventListener('mousedown', whenMouseDown);
    };
}

interface Point { x: number; y: number }
export function enableMoving(startAt = { x: 0, y: 0 }) {
    let handleElement: HTMLElement | null = null;
    let rootElement: HTMLElement | null = null;
    let stopListening = ignore;
    return {
        whenHandleElement(element: HTMLElement | null): void {
            if (handleElement === element) return;
            if (isNull(element)) return;
            handleElement = element;
            stopListening();
            stopListening = enableMouseMoving(handleElement, rootElement, startAt);
        },
        whenRootElement(element: HTMLElement | null): void {
            if (rootElement === element) return;
            if (isNull(element)) return;
            rootElement = element;
            stopListening();
            stopListening = enableMouseMoving(handleElement, rootElement, startAt);
        },
    };
}
