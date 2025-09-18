import { isDefined } from '../shared/core';

export function addTag(tags: string[] | undefined, tag: string): string[] | undefined {
    tags = isDefined(tags) ? tags : [];
    tags = tags.filter(x => x.trim() !==  '');
    if (tag.trim() === '') return tags.length > 0 ? tags : undefined;
    return [...tags, tag].toSet().toArray();
}
