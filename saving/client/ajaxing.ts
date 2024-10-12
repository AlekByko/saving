import { fail } from './shared/core';

export function willFetch<T>(
    url: string,
    parse: (text: string, headers: string) => T,
): Promise<T> {
    const xhr = new XMLHttpRequest();
    return new Promise<T>((resolve, reject) => {
        xhr.onload = () => {
            const headers = xhr.getAllResponseHeaders();
            const parsed = parse(xhr.responseText, headers);
            return resolve(parsed);
        };
        xhr.onerror = e => {
            debugger;
            reject(e);
        };
        xhr.open('GET', url);
        xhr.send(null);
    });
}


export async function willPost(url: string, body: object) {
    try {
        const json = JSON.stringify(body);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
            body: json,
        });
        const result = await response.json();
        return result;
    } catch (e) {
        console.log(e);
        alert('BAD REQUEST!!!');
        debugger;
        return fail('BAD REQUEST');
    }
}
