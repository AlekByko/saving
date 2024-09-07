import React, { ChangeEventHandler, MouseEventHandler } from 'react';
import { BeAppliedConfig, BeReplacedConfigConcern } from './editing-configs';
import { KMeansClusteringModConfig } from './morphs';
import { Regarding } from './reacting';
import { $on, safeInside } from './shared/inside';

export type KMeansClusteringModderConcern =
    | BeAppliedConfig<KMeansClusteringModConfig>
    | BeReplacedConfigConcern<KMeansClusteringModConfig>;

export interface KMeansClusteringModderProps {
    config: KMeansClusteringModConfig;
    regarding: Regarding<KMeansClusteringModderConcern>;
}

const inConfig = safeInside<KMeansClusteringModConfig>();

export class KMeansClusteringModder extends React.PureComponent<KMeansClusteringModderProps>{

    static Concern: KMeansClusteringModderConcern;

    whenChangedK: ChangeEventHandler<HTMLInputElement> = e => {
        let { config } = this.props;
        const k = parseInt(e.currentTarget.value, 10);
        config = inConfig.k[$on](config, k);
        this.props.regarding({ about: 'be-replaced-config', config })
    }

    whenApplied: MouseEventHandler<HTMLButtonElement> = _e => {
        const { regarding, config } = this.props;
        regarding({ about: 'be-applied-config', config });
    }

    render() {
        const { config: { k } } = this.props;
        return <div>
            <div className="morph-props">
                K: <input className="morph-number" type="number" size={3} value={k} onChange={this.whenChangedK} />
            </div>
            <div>
                <button onClick={this.whenApplied}>Apply</button>
            </div>
        </div>;
    }
}
