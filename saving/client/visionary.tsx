import React from 'react';
import { faceListerConcern } from './editing-configs';
import { HorzVertBitHistoModder } from './horz-vert-bit-histo-modder';
import { KMeansClusteringModder } from './k-means-clustering-modder';
import { MorphFlowModder } from './morph-flow-modder';
import { VisionaryConfig } from './morphs';
import { enableMoving } from './moving-by-mouse';
import { Regarding } from './reacting';
import { willOpenJsonFile, willTrySaveFile } from './reading-writing-files';
import { AboutAllBut, broke, isNull, to } from './shared/core';
import { safeInside } from './shared/inside';
import { SquaresNormedEnergyModder } from './squares-normed-energy-modder';

export type VisionaryConcern =
    | AboutAllBut<ModderConcern, 'be-replaced-config'>;

type ModderConcern =
    | typeof MorphFlowModder.Concern
    | typeof KMeansClusteringModder.Concern
    | typeof HorzVertBitHistoModder.Concern
    | typeof SquaresNormedEnergyModder.Concern;

export interface VisionaryProps {
    baseDir: FileSystemDirectoryHandle;
    regarding: Regarding<VisionaryConcern>;
}

const inConfig = safeInside<VisionaryConfig>();

interface State {
    config: VisionaryConfig | null;
}

export class Visionary extends React.Component<VisionaryProps, State> {

    private moving = enableMoving();

    state = to<State>({ config: null });

    componentDidMount(): void {
        this.start();
    }

    async start() {
        const { baseDir } = this.props;
        const config = await willOpenVisionary(baseDir);
        this.setState({ config });
    }

    regardingModder: Regarding<ModderConcern> = concern => {
        let { config } = this.state;
        if (isNull(config)) return;
        switch (concern.about) {
            case 'be-applied-config': return this.props.regarding(concern);
            default: {
                config = faceListerConcern(inConfig.modders, config, concern);
            }
        }
        const { baseDir } = this.props;
        willTrySaveVisionary(baseDir, config);

        this.setState({ config });
    }

    render() {
        const { config } = this.state;
        if (isNull(config)) return null;
        const { modders } = config;
        return <div className="visionary" ref={this.moving.whenRootElement}>
            <div className="visionary-header" ref={this.moving.whenHandleElement}>Visionary</div>
            <div className="visionary-body">
                {modders.map(modder => {
                    const { key } = modder;
                    switch (modder.kind) {
                        case 'morph-flow-mod': return <MorphFlowModder key={key} config={modder} regarding={this.regardingModder} />;
                        case 'k-means-clustering-mod': return <KMeansClusteringModder key={key} config={modder} regarding={this.regardingModder} />;
                        case 'horz-vert-bit-histo-mod': return <HorzVertBitHistoModder key={key} config={modder} regarding={this.regardingModder} />
                        case 'squares-normed-energy-mod': return <SquaresNormedEnergyModder key={key} config={modder} regarding={this.regardingModder} />
                        default: return broke(modder);
                    }
                })}
            </div>
        </div>;
    }
}

const visionaryFileName = 'visionary.json';

async function willOpenVisionary(
    dir: FileSystemDirectoryHandle,
): Promise<VisionaryConfig> {
    const result: VisionaryConfig = await willOpenJsonFile(dir, visionaryFileName);
    return result;
}

async function willTrySaveVisionary(
    dir: FileSystemDirectoryHandle,
    config: VisionaryConfig,
): Promise<boolean> {
    const json = JSON.stringify(config, null, 4);
    return willTrySaveFile(dir, visionaryFileName, json, false);
}
