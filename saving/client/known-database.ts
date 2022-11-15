import { knownDbStores } from "./known-settings";
import { camConfigNames } from './shared/cam-config';
import { isNonNull, isNull } from './shared/core';
import { StoreName } from './shared/identities';

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
        request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
            debugger;
            // this callback is the only place where createObjectStore can be called
            const db = this.result;
            const request = event.target as IDBOpenDBRequest;
            const transation = request.transaction;
            if (isNull(transation)) return;
            transation.onerror = e => {
                debugger;
                console.error(e);
                throw e;
            };

            if (!hasStore(transation, knownDbStores.cams.storeName)) {
                db.createObjectStore(knownDbStores.cams.storeName, { keyPath: knownDbStores.cams.keyPath });
            }
            if (!hasStore(transation, knownDbStores.tags.storeName)) {
                db.createObjectStore(knownDbStores.tags.storeName, { keyPath: knownDbStores.tags.keyPath });
            }
            if (!hasStore(transation, knownDbStores.dirs.storeName)) {
                db.createObjectStore(knownDbStores.dirs.storeName, { keyPath: knownDbStores.dirs.keyPath });
            }
            if (!hasStore(transation, knownDbStores.words.storeName)) {
                db.createObjectStore(knownDbStores.words.storeName, { keyPath: knownDbStores.words.keyPath });
            }

            const store = tryGetStore(transation, knownDbStores.cams.storeName);
            if (isNull(store)) return;

            const rankIndexName = camConfigNames.rank;
            if (!store.indexNames.contains(rankIndexName)) {
                store.createIndex(rankIndexName, camConfigNames.rank, { unique: false });
            }
        };
    });
}


function tryGetStore(transation: IDBTransaction, name: StoreName): IDBObjectStore | null {
    try {
        return transation.objectStore(name);
    } catch (e) {
        console.error(e);
        return null;
    }
}
function hasStore(transaction: IDBTransaction, name: StoreName): boolean {
    return isNonNull(tryGetStore(transaction, name));
}
