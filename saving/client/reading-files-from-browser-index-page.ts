import { fail, isNull } from "./core";
import { stripEndOrFail } from "./texting";
import { Timestamp } from "./time-stamping";

export interface FileInfo {
    type: 'file';
    link: string;
    name: string;
    size: number;
    timestamp: Timestamp;
}

export interface DirInfo {
    type: 'dir';
    link: string;
    name: string;
    timestamp: Timestamp;
}

export type EntryInfo = FileInfo | DirInfo;
export type EntryType = EntryInfo['type'];

function offReadingDir(
    toUrl: (href: string) => string,
    done: (all: EntryInfo[]) => void
): void {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.onload = () => {
        const doc = iframe.contentWindow?.document;
        if (!doc) return;
        const tds = doc.body.querySelectorAll('[data-value]');
        let entry: EntryInfo | null = null;
        const entries: EntryInfo[] = [];
        tds.forEach((td): void => {
            const anchor = td.querySelector('a');
            if (anchor) {
                if (entry) {
                    entries.push(entry);
                }
                entry = {} as EntryInfo;
                const type = entry.type = toEntryType(anchor.className);
                entry.link = anchor.href;
                entry.name = toEntryName(type, anchor.innerText);
            } else {
                if (isNull(entry)) return fail('No entry.')
                const text = td.getAttribute('data-value');
                if (isNull(text)) return fail('No attribute.');
                const data = parseInt(text, 10);
                if (entry.type === 'file') {
                    if (!entry.size) {
                        entry.size = data;
                    } else {
                        entry.timestamp = data as Timestamp;
                    }
                } else {
                    if (td.innerHTML.trim() === '') {
                        // skip
                    } else {
                        entry.timestamp = data as Timestamp;
                    }
                }
            }
        });
        if (entry) {
            entries.push(entry);
        }
        document.body.removeChild(iframe);
        done(entries);
    }
    iframe.src = toUrl(location.href);
}
function toEntryName(type: EntryType, text: string): string {
    switch(type) {
        case 'file': return text;
        case 'dir': return stripEndOrFail(text, '/', 'Invalid dir entry name.');
    }

}
function toEntryType(className: string): EntryType {
    switch (className) {
        case 'icon dir': return 'dir';
        case 'icon file': return 'file';
        default: return fail('Unknown entry type: ' + className);
    }
}

export function willReadDir(toUrl: (href: string) => string) {
    return new Promise<EntryInfo[]>(
        resolve => offReadingDir(toUrl, resolve)
    );
}
