import { StoreName } from './shared/identities';

export function willFindAllInStoreOf<T>(
    db: IDBDatabase,
    storeName: StoreName,
    isIt: (value: T) => boolean,
): Promise<T[]> {
    const transation = db.transaction([storeName], 'readonly');
    const store = transation.objectStore(storeName);
    const request = store.openCursor();
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
