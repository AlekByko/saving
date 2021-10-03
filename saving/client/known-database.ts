import { knownDbStores } from "./known-settings";

export function willOpenKnownDb(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const { name, version,
            tags, cams,
            dirs } = knownDbStores;
        const request = window.indexedDB.open(name, version);
        request.onerror = function () {
            reject(this.error);
        };
        request.onsuccess = function () {
            resolve(this.result);
        };
        request.onupgradeneeded = function () {
            // this callback is the only place where createObjectStore can be called
            const db = this.result;
            db.createObjectStore(cams.storeName, { keyPath: cams.keyPath });
            db.createObjectStore(tags.storeName, { keyPath: tags.keyPath });
            db.createObjectStore(dirs.storeName, { keyPath: dirs.keyPath });
        };
    });
}
