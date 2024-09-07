
export type MorphConfig =
    | GaussBlurMorphConfig
    | WeighedGrayMorphConfig
    | DynamicThrescholdMorphConfig
    | MaxVotingMorphConfig
    | HorzVertBitHistoMorphConfig;

export interface HorzVertBitHistoMorphConfig {
    kind: 'horz-vert-bit-histo-morph';
    key: string;
    isEnabled: boolean;
    vectorSize: number;
}

export interface GaussBlurMorphConfig {
    kind: 'gauss-blur-morph';
    key: string;
    isEnabled: boolean;
    kernelSize: number;
}

export interface WeighedGrayMorphConfig {
    kind: 'weighed-gray-morph';
    key: string;
    isEnabled: boolean;
}


export interface DynamicThrescholdMorphConfig {
    kind: 'dynamic-threschold-morph';
    key: string;
    isEnabled: boolean;
    gaussKernelSize: number;
    minDynamicRange: number;
    dynamicWindowSize: number;
    shouldUseMinDynamicRange: boolean;
}

export interface MaxVotingMorphConfig {
    kind: 'max-voting-morph';
    key: string;
    isEnabled: boolean;
    windowSize: number;
}

export type ModConfig =
    | MorphFlowModConfig
    | KMeansClusteringModConfig;

export interface MorphFlowModConfig {
    kind: 'morph-flow-mod';
    key: string;
    morphs: MorphConfig[];
}
export interface KMeansClusteringModConfig {
    kind: 'k-means-clustering-mod';
    key: string;
    k: number;
}

export interface VisionaryConfig {
    modders: ModConfig[];
}
