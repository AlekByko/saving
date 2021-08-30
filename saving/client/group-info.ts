import { As } from './shared/core';

export type GroupId = number & As<'group-id'>;
let lastGroupId = 0;
export function toNextGroupId() {
    return lastGroupId++ as GroupId;
}
export interface GroupInfo {
    id: GroupId;
}
