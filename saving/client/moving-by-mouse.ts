import { ignore, isNull } from '../shared/core';

export function enableMouseMoving(
    handleElement: HTMLElement | null,
    rootElementOrNull: HTMLElement | null,
): () => void {

    if (isNull(handleElement) || isNull(rootElementOrNull)) return ignore;
    const rootElement = rootElementOrNull;
    const thisRect = rootElement.getBoundingClientRect();

    let x = thisRect.left;
    let y = thisRect.top

    function whenMouseUp(_e: MouseEvent): void {
        document.removeEventListener('mousemove', whenMouseMove);
        document.removeEventListener('mouseup', whenMouseUp);
    }

    function whenMouseMove(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();
        let dx = e.pageX - lastX;
        let dy = e.pageY - lastY;
        lastX = e.pageX;
        lastY = e.pageY;
        x += dx;
        y += dy;
        rootElement.style.left = x + 'px';
        rootElement.style.top = y + 'px';
    }

    let lastX = 0;
    let lastY = 0;
    function whenMouseDown(e: MouseEvent): void {

        if (e.currentTarget !== e.target) return; // only allow moving if clicked on the element and not on any of its children

        lastX = e.pageX;
        lastY = e.pageY;
        document.addEventListener('mousemove', whenMouseMove);
        document.addEventListener('mouseup', whenMouseUp);
    }

    handleElement.addEventListener('mousedown', whenMouseDown);

    return function stopListening(): void {
        handleElement.removeEventListener('mousedown', whenMouseDown);
    };
}


export function enableMoving() {
    let handleElement: HTMLElement | null = null;
    let rootElement: HTMLElement | null = null;
    let stopListening = ignore;
    return {
        whenHandleElement(element: HTMLElement | null): void {
            if (handleElement === element) return;
            if (isNull(element)) return;
            handleElement = element;
            stopListening();
            stopListening = enableMouseMoving(handleElement, rootElement);
        },
        whenRootElement(element: HTMLElement | null): void {
            if (rootElement === element) return;
            if (isNull(element)) return;
            rootElement = element;
            stopListening();
            stopListening = enableMouseMoving(handleElement, rootElement);
        },
    };
}
