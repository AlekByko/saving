import { StoreName } from './known-db-stores';

export function willFindAllInStoreOf<T, Query>(
    db: IDBDatabase,
    storeName: StoreName,
    isIt: (value: T) => boolean,
    query: Query,
    openCursor: (store: IDBObjectStore, query: Query) => IDBRequest<IDBCursorWithValue | null>,
): Promise<T[]> {
    const transation = db.transaction([storeName], 'readonly');
    const store = transation.objectStore(storeName);
    const request = openCursor(store, query);
    const result: T[] = [];
    return new Promise<T[]>((resolve, reject) => {
        transation.onerror = reject;
        transation.onabort = reject;
        request.onerror = reject;
        request.onsuccess = function () {
            var cursor = this.result
            if (cursor) {
                // cursor.value contains the current record being iterated through
                // this is where you'd do something with the result
                const { value } = cursor;
                if (isIt(value)) {
                    result.push(value);
                }
                cursor.continue();
            } else {
                resolve(result);
            }
        };
    });
}

export function willFindOneInStoreOr<T, Or>(
    db: IDBDatabase,
    storeName: StoreName,
    key: string,
    or: Or,
): Promise<T | Or> {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    return new Promise<T | Or>((resolve, reject) => {
        transaction.onerror = reject;
        transaction.onabort = reject;
        request.onerror = reject;
        request.onsuccess = function () {
            var value = this.result;
            if (value) {
                resolve(value);
            } else {
                resolve(or);
            }
        };
    });
}

export function willFindOneInStoreOrOtherwise<T, Or, W>(
    db: IDBDatabase,
    storeName: StoreName,
    key: string,
    or: Or,
    otherwise: (or: Or) => W,
): Promise<T | W> {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    return new Promise<T | W>((resolve, reject) => {
        transaction.onerror = reject;
        transaction.onabort = reject;
        request.onerror = reject;
        request.onsuccess = function () {
            var value = this.result;
            if (value) {
                resolve(value);
            } else {
                resolve(otherwise(or));
            }
        };
    });
}


export async function willPutAllToStoreOf<T>(
    db: IDBDatabase, values: T[], storeName: StoreName
): Promise<void> {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const onceAll = new Promise<void>((resolve, reject) => {
        transaction.onabort = reject;
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve();
        // TODO: https://stackoverflow.com/a/52555073
        for (let index = 0; index < values.length; index++) {
            const value = values[index];
            const request = store.put(value);
            request.onerror = reject;
        }
    });

    return onceAll;
}


