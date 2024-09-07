import React, { ChangeEventHandler } from 'react';
import { BeReplacedConfigConcern, faceListerConcern } from './editing-morphs';
import { MorphLister, MorphListerConcern } from './morph-lister';
import { MorphFlowModConfig } from './morphs';
import { Regarding } from './reacting';
import { $on, safeInside } from './shared/inside';

export type MorphFlowModderConcern =
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

    whenChangeIsApplied: ChangeEventHandler<HTMLInputElement> | undefined = e => {
        const isApplied = e.currentTarget.checked;
        let { config } = this.props;
        config = inConfig.isApplied[$on](config, isApplied);
        this.props.regarding({ about: 'be-replaced-config', config })
    }

    render() {
        const { config: {  isApplied, morphs } } = this.props;
        return <div>
            <div>
                <MorphLister morphs={morphs} regarding={this.regardingEditor} />
            </div>
            <div>
                <label><input type="checkbox" onChange={this.whenChangeIsApplied} checked={isApplied} /> apply?</label>
            </div>
        </div>;
    }
}
