import React, { MouseEventHandler } from 'react';
import { BeAppliedConfig, BeReplacedConfigConcern, faceListerConcern } from './editing-configs';
import { MorphLister, MorphListerConcern } from './morph-lister';
import { MorphFlowModConfig } from './morphs';
import { Regarding } from './reacting';
import { safeInside } from './shared/inside';

export type MorphFlowModderConcern =
    | BeAppliedConfig<MorphFlowModConfig>
    | BeReplacedConfigConcern<MorphFlowModConfig>;

export interface MorphFlowModderProps {
    config: MorphFlowModConfig;
    regarding: Regarding<MorphFlowModderConcern>;
}

const inConfig = safeInside<MorphFlowModConfig>();

export class MorphFlowModder extends React.PureComponent<MorphFlowModderProps>{

    static Concern: MorphFlowModderConcern;

    regardingEditor: Regarding<MorphListerConcern> = concern => {

        let { config } = this.props;
        config = faceListerConcern(inConfig.morphs, config, concern);
        this.props.regarding({ about: 'be-replaced-config', config })
    }
    whenApplied: MouseEventHandler<HTMLButtonElement> = _e => {
        const { regarding, config } = this.props;
        regarding({ about: 'be-applied-config', config });
    }

    render() {
        const { config: { morphs } } = this.props;
        return <div>
            <div>
                <MorphLister morphs={morphs} regarding={this.regardingEditor} />
            </div>
            <div>
                <button onClick={this.whenApplied}>Apply</button>
            </div>
        </div>;
    }
}
