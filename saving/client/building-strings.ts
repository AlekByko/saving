import { isDefined, LikeUndefined } from './shared/core';

export function buildingString(text?: string): BuildingStringing {
    return new BuildingStringing().addIfDefined(text);
}

class BuildingStringing {
    constructor(private all: string[] = []) { }
    add(text: string): BuildingStringing {
        this.all.push(text);
        return this;
    }
    addIfDefined<T extends LikeUndefined<T>>(text: T): BuildingStringing {
        if(isDefined(text)) {
            this.all.push(text);
        }
        return this;
    }
    addIf(shouldIt: boolean, text: string): BuildingStringing {
        if (shouldIt) {
            this.all.push(text);
        }
        return this;
    }
    join(delimiter: string): string {
        return this.all.join(delimiter);
    }
}
