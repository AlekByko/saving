import { thusStorageTrackerOf } from './storage-tracker';

export type MorphConfig =
    | GaussBlurMorphConfig
    | WeighedGrayMorphConfig
    | DynamicThrescholdMorphConfig
    | MaxVotingMorphConfig
    | HorzVertBitHistoMorpgConfig;

export type Morph =
    | GaussBlurMorph
    | WeighedGrayMorph
    | DynamicThrescholdMorph
    | MaxVotingMorph
    | HorzVertBitHistoMorph;

export interface HorzVertBitHistoMorpgConfig {
    kind: 'horz-vert-bit-histo-morph';
    isEnabled: boolean;
    vectorSize: number;
}
export interface HorzVertBitHistoMorph
    extends HorzVertBitHistoMorpgConfig {
    key: string;
}

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
    gaussKernelSize: number;
    minDynamicRange: number;
    dynamicWindowSize: number;
    shouldUseMinDynamicRange: boolean;
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

