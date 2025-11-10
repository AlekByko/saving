import { willLoadImageFromUrlOr } from 'loading-images';
import { isNull } from '../shared/core';

/**!!! AN OVERKILL FOR TYPICAL USE WHEN ONLY URL IS NEEDED !!! SHOULD NOT MAKE AN HTML IMAGE OBJECT !!! */
export async function willReadImageFromFileHandle(handle: FileSystemFileHandle) {
    const file = await handle.getFile();
    return willReadImageFromFile(file);
}

export async function willReadImageFromFile(file: File) {
    const url = URL.createObjectURL(file);
    const image = await willLoadImageFromUrlOr(url, 1000 * 10, null);
    if (isNull(image)) return null;
    return { image, url };
}

export async function willReadJsonFromFileHandleOr<Or, T = {}>(handle: FileSystemFileHandle, or: Or): Promise<T | Or> {
    const file = await handle.getFile();
    const text = await file.text();
    const obj = parseJsonOr<T, Or>(text, or);
    return obj;
}


export function parseJsonOr<Json, Or>(text: string, or: Or): Json | Or {
    try {
        return JSON.parse(text);
    } catch {
        return or;
    }
}
