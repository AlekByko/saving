
export function willLoadImageFromUrl(url: string) {
    return new Promise<HTMLImageElement>(resolve => {
        const imageElement = document.createElement('img');
        imageElement.onload = () => resolve(imageElement);
        imageElement.src = url;
    });
}
