
export type MorphConfig =
    | GaussBlurMorphConfig
    | WeighedGrayMorphConfig
    | DynamicThrescholdMorphConfig
    | MaxVotingMorphConfig;

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
    | HorzVertBitHistoModConfig
    | KMeansClusteringModConfig;

export interface MorphFlowModConfig {
    kind: 'morph-flow-mod';
    key: string;
    morphs: MorphConfig[];
}

export interface HorzVertBitHistoModConfig {
    kind: 'horz-vert-bit-histo-mod';
    key: string;
    featureVectorSize: number;
}

export interface KMeansClusteringModConfig {
    kind: 'k-means-clustering-mod';
    key: string;
    k: number;
}

export interface VisionaryConfig {
    modders: ModConfig[];
}
