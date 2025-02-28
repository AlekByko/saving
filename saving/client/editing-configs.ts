import { broke } from '../shared/core';
import { $across, $of, $on, By } from '../shared/inside';
import { thusUpDown } from './up-down';


export interface BeReplacedConfigConcern<Config> {
    about: 'be-replaced-config'; config: Config;
}

export interface BeMovedConfigConcern {
    about: 'be-moved-config'; key: string; delta: number;
}

export interface BeAppliedConfigConcern<Config> {
    about: 'be-applied-config'; config: Config;
}

export const UpDown = thusUpDown({
    makeUp: (key: string) => ({ about: 'be-moved-config', key, delta: -1 }) satisfies BeMovedConfigConcern,
    makeDown: key => ({ about: 'be-moved-config', key, delta: +1 }) satisfies BeMovedConfigConcern,
});

export type ListerConcern<Config> =
    | BeMovedConfigConcern
    | BeReplacedConfigConcern<Config>;

export function faceListerConcern<Owner, Config extends { key: string; }>(
    byConfigs: By<Owner, Config[]>,
    owner: Owner,
    concern: ListerConcern<Config>,
): Owner {
    switch (concern.about) {
        case 'be-replaced-config': {
            const { config } = concern;
            owner = byConfigs[$across](owner, morphs => morphs.map(next => {
                if (next.key === config.key) {
                    return config;
                } else {
                    return next;
                }
            }));
            return owner;
        }
        case 'be-moved-config': {
            const { key, delta } = concern;
            const morphs = byConfigs[$of](owner);
            const foundAt = morphs.findIndex(x => x.key === key);
            if (foundAt < 0) return owner;
            let at = foundAt + delta;
            at = (morphs.length + at) % morphs.length;
            const newer = morphs[foundAt];
            const older = morphs[at];
            morphs[at] = newer;
            morphs[foundAt] = older;
            owner = byConfigs[$on](owner, [...morphs]);
            return owner;
        }
        default: return broke(concern);
    }
}
