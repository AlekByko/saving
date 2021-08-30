import { isNull } from './shared/core';
import { getStorage } from './storage';

const storage = getStorage();

export function henceStoring<T>(storageKey: string, orElse: () => T) {

    function load(): T {
        const json = storage.getItem(storageKey);
        if (isNull(json)) return orElse();
        const data = JSON.parse(json);
        return data;
    }

    function save(data: T): void {
        const json = JSON.stringify(data);
        storage.setItem(storageKey, json);
    }

    return { load, save };
}
