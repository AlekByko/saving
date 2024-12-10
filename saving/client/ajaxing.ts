import { broke, fail, fix } from './shared/core';

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
    const posted = await willPostExt(url, body);
    switch (posted.kind) {
        case 'got-json':
            break;

        case 'bad-json':
        case 'no-response':
        case 'bad-response':
            console.log(posted);
            alert('BAD REQUEST!!!');
            debugger;
            return fail('BAD REQUEST');
        default: return broke(posted);
    }
    const { json } = posted;
    return json;
}

export async function willPostExt(url: string, body: object) {

    const fetched = await willTryMakePostRequest(url, body);
    switch (fetched.kind) {
        case 'got-response':
            break;
        case 'no-response':
        case 'bad-response':
            return fetched;
        default: broke(fetched);
    }
    const { response } = fetched;
    const text = await response.text();
    const parsed = parseJson(text);
    switch (parsed.kind) {
        case 'got-json': return parsed;
        case 'bad-json': return parsed;
        default: return broke(parsed);
    }
}

export async function willGetExt(url: string) {

    const fetched = await willTryMakeGetRequest(url);
    switch (fetched.kind) {
        case 'got-response':
            break;
        case 'no-response':
        case 'bad-response':
            return fetched;
        default: broke(fetched);
    }
    const { response } = fetched;
    const text = await response.text();
    const parsed = parseJson(text);
    switch (parsed.kind) {
        case 'got-json': return parsed;
        case 'bad-json': return parsed;
        default: return broke(parsed);
    }
}

export function parseJson(text: string) {
    try {
        const json = JSON.parse(text);
        return fix({ kind: 'got-json', json });
    } catch (e) {
        return fix({ kind: 'bad-json', e, text });
    }
}

export async function willTryMakeGetRequest(url: string) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const { status: code, statusText: message, url } = response;
            return fix({ kind: 'bad-response', code, message, url, response });
        }
        return fix({ kind: 'got-response', response });
    } catch (e) {
        return fix({ kind: 'no-response', e });
    }
}
export async function willTryMakePostRequest(url: string, body: object) {
    const json = JSON.stringify(body);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
            body: json,
        });
        if (!response.ok) {
            const { status: code, statusText: message, url } = response;
            return fix({ kind: 'bad-response', code, message, url, response });
        }
        return fix({ kind: 'got-response', response });
    } catch (e) {
        return fix({ kind: 'no-response', e });
    }
}

