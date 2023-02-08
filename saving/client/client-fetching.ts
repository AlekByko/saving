import { fail } from './shared/core';

export function willHttpGet(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            resolve(xhr.responseText);
        }
        xhr.onerror = function () {
            reject(xhr);
        }
        xhr.send(null);
    });
}

export async function willParseResponseAsJson(response: Response): Promise<any> {
    try {
        return await response.json();
    } catch (e) {
        console.error(e);
        const text = await response.text();
        console.warn(text);
        return fail('Unable to parse JSON');
    }
}
