import { thusStorageTrackerOf } from './storage-tracker';

export type MorphConfig =
    | GaussBlurMorphConfig
    | WeighedGrayMorphConfig
    | DynamicThrescholdMorphConfig
    | MaxVotingMorphConfig;

export type Morph =
    | GaussBlurMorph
    | WeighedGrayMorph
    | DynamicThrescholdMorph
    | MaxVotingMorph;

export interface GaussBlurMorphConfig {
    kind: 'gauss-blur-morph';
    isEnabled: boolean;
    kernelSize: number;
}

export interface GaussBlurMorph
    extends GaussBlurMorphConfig {
    key: string;
}

export interface WeighedGrayMorphConfig {
    kind: 'weighed-gray-morph';
    isEnabled: boolean;
}
export interface WeighedGrayMorph
    extends WeighedGrayMorphConfig {
    key: string;
}

export interface DynamicThrescholdMorphConfig {
    kind: 'dynamic-threschold-morph';
    isEnabled: boolean;
    windowSize: number;
}
export interface DynamicThrescholdMorph
    extends DynamicThrescholdMorphConfig {
    key: string;
}

export interface MaxVotingMorphConfig {
    kind: 'max-voting-morph';
    isEnabled: boolean;
    windowSize: number;
}
export interface MaxVotingMorph
    extends MaxVotingMorphConfig {
    key: string;
}

export interface MorphFlowConfig {
    name: string;
    morphs: MorphConfig[];
}

export const StorageTracker = thusStorageTrackerOf<MorphFlowConfig, string>('morph', 100, x => x.name);

