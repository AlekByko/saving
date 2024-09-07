import React, { ChangeEventHandler } from 'react';
import { BeReplacedConfigConcern, UpDown } from './editing-configs';
import { GaussBlurMorphConfig } from './morphs';
import { Regarding } from './reacting';

export type GaussBlurMorphEditorConcern =
    | BeReplacedConfigConcern<GaussBlurMorphConfig>
    | typeof UpDown.Concern;

export interface GaussBlurMorphEditorProps {
    config: GaussBlurMorphConfig;
    regarding: Regarding<GaussBlurMorphEditorConcern>;
}

export class GaussBlurMorphEditor extends React.PureComponent<GaussBlurMorphEditorProps> {

    static Concern: GaussBlurMorphEditorConcern;

    transform = (change: (morph: GaussBlurMorphConfig) => GaussBlurMorphConfig) => {
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
        this.transform(morph => ({
            ...morph,
            kernelSize: parseInt(e.currentTarget.value, 10)
        }));
    };
    render() {
        const { config: { isEnabled, kernelSize, key }, regarding } = this.props;
        return <div className="morph">
            <div className="morph-name">
                <label><input type="checkbox" checked={isEnabled} onChange={this.whenToggled} /> gauss blur</label>  <span>
                    <UpDown context={key} regarding={regarding} />
                </span>
            </div>
            <div className="morph-props">
                kernel size: <input className="morph-number" type="number" size={3} value={kernelSize} onChange={this.whenChangedSize} />
            </div>
        </div>;
    }
}
