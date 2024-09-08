import React, { ChangeEventHandler, MouseEventHandler } from 'react';
import { BeAppliedConfigConcern, BeReplacedConfigConcern } from './editing-configs';
import { HorzVertBitHistoModConfig } from './morphs';
import { Regarding } from './reacting';

export type HorzVertBitHistoModderConcern =
    | BeReplacedConfigConcern<HorzVertBitHistoModConfig>
    | BeAppliedConfigConcern<HorzVertBitHistoModConfig>;

export interface HorzVertBitHistoModderProps {
    config: HorzVertBitHistoModConfig;
    regarding: Regarding<HorzVertBitHistoModderConcern>;
}

export class HorzVertBitHistoModder extends React.PureComponent<HorzVertBitHistoModderProps> {

    static Concern: HorzVertBitHistoModderConcern;

    transform = (change: (morph: HorzVertBitHistoModConfig) => HorzVertBitHistoModConfig) => {
        let { config, regarding } = this.props;
        config = change(config);
        regarding({ about: 'be-replaced-config', config });
    }
    whenToggled: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({
            ...morph,
            isEnabled: e.currentTarget.checked
        }));
    };

    whenChangedSize: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, featureVectorSize: parseInt(e.currentTarget.value, 10) }));
    };

    whenApplied: MouseEventHandler<HTMLButtonElement> = _e => {
        const { regarding, config } = this.props;
        regarding({ about: 'be-applied-config', config });
    };

    render() {
        const { config: { featureVectorSize } } = this.props;
        return <div className="mod">
            <div className="mod-name">H/V bit histo</div>
            <div className="morph-props">
                feature vector size: <input className="morph-number" type="number" value={featureVectorSize} onChange={this.whenChangedSize} />
            </div>
            <div>
                <button onClick={this.whenApplied}>Apply</button>
            </div>
        </div>;
    }
}
