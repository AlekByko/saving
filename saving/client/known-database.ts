import { isNonNull } from '../shared/core';
import { knownDbStores, StoreName } from "./known-db-stores";

export function willOpenKnownDb(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const { name, version } = knownDbStores;
        const request = window.indexedDB.open(name, version);
        request.onerror = function () {
            reject(this.error);
        };
        request.onsuccess = function () {
            resolve(this.result);
        };
        request.onupgradeneeded = function (_event: IDBVersionChangeEvent) {
            makeSureDbStoresCreated(this.result);
        };
    });
}

export function makeSureDbStoresCreated(
    db: IDBDatabase,
) {
    const { dirs } = knownDbStores;
    if (!db.objectStoreNames.contains(dirs.storeName)) {
        db.createObjectStore(dirs.storeName, { keyPath: dirs.keyPath });
    }
}


function tryGetStore(transation: IDBTransaction, name: StoreName): IDBObjectStore | null {
    try {
        return transation.objectStore(name);
    } catch (e) {
        console.error(e);
        return null;
    }
}

export function seeIfHasStore(transaction: IDBTransaction, name: StoreName): boolean {
    return isNonNull(tryGetStore(transaction, name));
}
