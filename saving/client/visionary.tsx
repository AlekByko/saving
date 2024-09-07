import React from 'react';
import { BeReplacedConfigConcern, faceListerConcern, willOpenVisionary, willTrySaveVisionary } from './editing-morphs';
import { MorphFlowModder } from './morph-flow-modder';
import { ModConfig, VisionaryConfig } from './morphs';
import { enableMoving } from './moving-by-mouse';
import { Regarding } from './reacting';
import { broke, isNull, to } from './shared/core';
import { safeInside } from './shared/inside';

export type VisionaryConcern =
    | { about: 'be-applied-mod'; mod: ModConfig };

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

    regardingModder: Regarding<BeReplacedConfigConcern<ModConfig>> = concern => {
        let { config } = this.state;
        if (isNull(config)) return;
        config = faceListerConcern(inConfig.modders, config, concern);
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
                        case 'morph-flow-modder': return <MorphFlowModder key={key} config={modder} regarding={this.regardingModder} />;
                        default: return broke(modder.kind);
                    }
                })}
            </div>
        </div>;
    }
}

