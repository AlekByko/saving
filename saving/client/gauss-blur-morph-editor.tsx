import React, { ChangeEventHandler } from 'react';
import { BeReplacedMorphConcern, UpDown } from './editing-morphs';
import { GaussBlurMorph } from './morphs';
import { Regarding, toNextKey } from './reacting';

export type GaussBlurMorphEditorConcern =
    | BeReplacedMorphConcern<GaussBlurMorph>
    | typeof UpDown.Concern;

export interface GaussBlurMorphEditorProps {
    morph: GaussBlurMorph;
    regarding: Regarding<GaussBlurMorphEditorConcern>;
}

export class GaussBlurMorphEditor extends React.PureComponent<GaussBlurMorphEditorProps> {

    static Concern: GaussBlurMorphEditorConcern;

    transform = (change: (morph: GaussBlurMorph) => GaussBlurMorph) => {
        let { morph, regarding } = this.props;
        const { key } = morph;
        morph = change(morph);
        morph.key = toNextKey();
        regarding({ about: 'be-replaced-morph', key, morph });
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
        const { morph: { isEnabled, kernelSize, key }, regarding } = this.props;
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
