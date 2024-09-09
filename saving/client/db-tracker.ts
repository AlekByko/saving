import { fail, isUndefined, same } from './shared/core';
import { Timestamp, toTimestamp } from './shared/time-stamping';

export function thusDbTracker<Config, Key extends string, Context>(
    delay: number,
    keyOf: (config: Config) => Key,
    setLastSaved: (config: Config, now: Timestamp) => void,
    willPull: (context: Context, key: Key[]) => Promise<Config[]>,
    willSave: (context: Context, configs: Config[]) => Promise<void>,
) {
    return class DbTracker {
        private dirty = new Set<Key>();
        private all = new Map<Key, Config>();

        constructor(
            private context: Context,
        ) { }

        public async willPull(keys: Key[]): Promise<Config[]> {
            const configs = await willPull(this.context, keys);
            for (const config of configs) {
                this.all.set(keyOf(config), config);
            }
            return configs;
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

        // TODO: rename
        public there(
            key: Key,
            across: (found: Config) => Config,
            make: (key: Key, to: (config: Config) => Config) => Config,
        ): void {
            if (this.all.has(key)) {
                const older = this.all.get(key)!;
                const newer = across(older);
                this.dirty.add(key);
                if (older !== newer) {
                    // we only need to rewrite, if we got a new object, there is no need to rewrite an old (but mutated) object
                    this.all.set(key, newer);
                }
                this.scheduleSaving();
            } else {
                const newer = make(key, same);
                this.dirty.add(key);
                this.all.set(key, newer);
                this.scheduleSaving();
            }
        }

        public takeAllWithoutSaving(configs: Config[]): void {
            configs.forEach(config => {
                const key = keyOf(config);
                this.all.set(key, config);
            });
        }

        public across(
            key: Key,
            across: (found: Config) => Config,
        ): void {
            if (!this.all.has(key)) return;

            const older = this.all.get(key)!;
            const newer = across(older);
            this.dirty.add(key);
            if (older !== newer) {
                // we only need to rewrite, if we got a new object, there is no need to rewrite an old (but mutated) object
                this.all.set(key, newer);
            }
            this.scheduleSaving();
        }

        public async willPut(config: Config): Promise<void> {
            const key = keyOf(config);
            this.dirty.add(key);
            this.all.set(key, config);
            await this.saveNow();
        }
        public async willPutAll(configs: Config[]): Promise<void> {
            for (const config of configs) {
                const key = keyOf(config);
                this.dirty.add(key);
                this.all.set(key, config);
            }
            await this.saveNow();
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

        private scheduledSaving = 0;
        private isSaving = false;
        private scheduleSaving(): void {
            clearTimeout(this.scheduledSaving);
            this.scheduledSaving = window.setTimeout(() => {
                if (this.isSaving) {
                    this.scheduleSaving();
                } else {
                    this.saveNow();
                }
            }, delay);
        }

        private async saveNow() {
            if (this.isSaving) return;
            this.isSaving = true;
            const configs = this.toUnsavedConfigs();
            const now = toTimestamp();
            configs.forEach(config => {
                setLastSaved(config, now);
            });
            await willSave(this.context, configs);
            console.log('saved to db', configs);
            this.isSaving = false;
        }

        private toUnsavedConfigs(): Config[] {
            const dirty = this.dirty;
            this.dirty = new Set<Key>();
            const unsaved: Config[] = [];
            dirty.forEach((key): void => {
                const found = this.all.get(key);
                if (isUndefined(found)) return fail('There is nothing at \'' + key + '\'.');
                unsaved.push(found);
            });
            return unsaved;
        }
    };
}

