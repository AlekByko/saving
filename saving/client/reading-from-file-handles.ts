import { willLoadImageFromUrl } from 'loading-images';

/**!!! AN OVERKILL FOR TYPICAL USE WHEN ONLY URL IS NEEDED !!! SHOULD NOT MAKE AN HTML IMAGE OBJECT !!! */
export async function willReadImageFromFileHandle(handle: FileSystemFileHandle) {
    const blob = await handle.getFile();
    const url = URL.createObjectURL(blob);
    const image = await willLoadImageFromUrl(url);
    return { image, url };
}

export async function willReadJsonFromFileHandle<T = any>(handle: FileSystemFileHandle): Promise<T> {
    const blob = await handle.getFile();
    const json = await blob.text();
    const obj = JSON.parse(json);
    return obj as T;
}
