import { KnownPickedDirEntry } from './file-system-entries';
export type KnownPickedDirRef = string & As<'known-picked-dir-ref'>;
export type StoreName = string & As<'store-name'>;

export const knownDbStores = {
    name: 'debushka',
    /**  JUST BUMPUP THE VERSION TO RECREATE THE STORES look for `makeSureDbStoresCreated` */
    version: 1,
    dirs: {
        T: null as unknown as KnownPickedDirEntry,
        storeName: 'fs' as StoreName,
        keyPath: 'name',
    }
} as const;
