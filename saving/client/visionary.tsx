import React from 'react';
import { faceListerConcern, willOpenVisionary, willTrySaveVisionary } from './editing-morphs';
import { HorzVertBitHistoModder } from './horz-vert-bit-histo-morph-editor';
import { KMeansClusteringModder } from './k-means-clustering-modder';
import { MorphFlowModder } from './morph-flow-modder';
import { VisionaryConfig } from './morphs';
import { enableMoving } from './moving-by-mouse';
import { Regarding } from './reacting';
import { AboutAllBut, broke, isNull, to } from './shared/core';
import { safeInside } from './shared/inside';

export type VisionaryConcern =
    | AboutAllBut<ModderConcern, 'be-replaced-config'>;

type ModderConcern =
    | typeof MorphFlowModder.Concern
    | typeof KMeansClusteringModder.Concern
    | typeof HorzVertBitHistoModder.Concern;

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
        return <div className="morpher" ref={this.moving.whenRootElement}>
            <div className="morpher-header" ref={this.moving.whenHandleElement}>Morpher header</div>
            <div>
                {modders.map(modder => {
                    const { key } = modder;
                    switch (modder.kind) {
                        case 'morph-flow-mod': return <MorphFlowModder key={key} config={modder} regarding={this.regardingModder} />;
                        case 'k-means-clustering-mod': return <KMeansClusteringModder key={key} config={modder} regarding={this.regardingModder} />;
                        case 'horz-vert-bit-histo-mod': return <HorzVertBitHistoModder key={key} config={modder} regarding={this.regardingModder} />
                        default: return broke(modder);
                    }
                })}
            </div>
        </div>;
    }
}

