import { isNull, same } from './shared/core';
import { getStorage } from './storage';

const storage = getStorage();

export function thusStorageTrackerOf<Config, Key>(
    storageKey: string,
    delay: number,
    keyOf: (config: Config) => Key,
) {
    return class Tracker {

        private all = new Map<Key, Config>();

        constructor() {
            const json = this.give();
            if (!isNull(json)) {
                this.init(json);
            }
        }

        private init(json: string): void {
            this.all.clear();
            const configs = JSON.parse(json) as Config[];
            configs.forEach(config => {
                const key = keyOf(config);
                this.all.set(key, config);
            });
        }

        public atOr<Or>(key: Key, or: Or): Config | Or {
            if (this.all.has(key)) return this.all.get(key)!;
            return or;
        }

        public insteadAtOr<U, Or>(key: Key, instead: (config: Config) => U, or: Or): U | Or {
            if (this.all.has(key)) {
                const found = this.all.get(key)!;
                const result = instead(found);
                return result;
            } else {
                return or;
            }
        }
        /** Gets config as JSON. */
        public give(): string | null {
            const json = storage.getItem(storageKey);
            return json;
        }
        public take(json: string): void {
            storage.setItem(storageKey, json);
            this.init(json);
        }

        public clear(): void {
            storage.removeItem(storageKey);
        }

        public has(key: Key): boolean {
            return this.all.has(key);
        }

        public claim(key: Key, toConfig: (key: Key) => Config): Config {
            if (this.all.has(key)) {
                return this.all.get(key)!;
            } else {
                const config = toConfig(key);
                this.all.set(key, config);
                this.storeLater();
                return config;
            }
        }
        public there(
            key: Key,
            across: (found: Config) => Config,
            make: (key: Key, to: (config: Config) => Config) => Config,
        ): void {
            if (this.all.has(key)) {
                const older = this.all.get(key)!;
                const newer = across(older);
                if (older !== newer) {
                    // we only need to rewrite, if we got a new object, there is no need to rewrite an old (but mutated) object
                    this.all.set(key, newer);
                }
                this.storeLater();
            } else {
                const newer = make(key, same);
                this.all.set(key, newer);
                this.storeLater();
            }
        }


        public across(
            key: Key,
            across: (found: Config) => Config,
        ): void {
            if (this.all.has(key)) {
                const older = this.all.get(key)!;
                const newer = across(older);
                if (older !== newer) {
                    // we only need to rewrite, if we got a new object, there is no need to rewrite an old (but mutated) object
                    this.all.set(key, newer);
                }
                this.storeLater();
            }
        }

        public forEach(use: (config: Config) => void): void {
            this.all.forEach(use);
        }

        public toArray(): Config[] {
            const result: Config[] = [];
            this.all.forEach(config => {
                result.push(config);
            });
            return result;
        }


        private scheduled = 0;
        private storeLater(): void {
            clearTimeout(this.scheduled);
            this.scheduled = window.setTimeout(() => {
                this.storeNow();
            }, delay);
        }

        private storeNow() {
            const configs = Array.from(this.all.values());
            const json = JSON.stringify(configs);
            storage.setItem(storageKey, json);
        }
    };
}
