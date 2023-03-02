
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

export async function willParseResponseAsJsonOr<T, Or>(response: Response, or: Or): Promise<T | Or> {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error(e);
        console.warn(text);
        return or;
    }
}
