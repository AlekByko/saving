import React, { ChangeEventHandler } from 'react';
import { BeReplacedMorphConcern, UpDown } from './editing-morphs';
import { DynamicThrescholdMorph } from './morphs';
import { Regarding, toNextKey } from './reacting';

export type DynamicThrescholdMorphEditorConcern =
    | BeReplacedMorphConcern<DynamicThrescholdMorph>
    | typeof UpDown.Concern;

export interface DynamicThrescholdMorphEditorProps {
    morph: DynamicThrescholdMorph;
    regarding: Regarding<DynamicThrescholdMorphEditorConcern>;
}

export class DynamicThrescholdMorphEditor extends React.PureComponent<DynamicThrescholdMorphEditorProps> {

    static Concern: DynamicThrescholdMorphEditorConcern;

    transform = (change: (morph: DynamicThrescholdMorph) => DynamicThrescholdMorph) => {
        let { morph, regarding } = this.props;
        const { key } = morph;
        morph = change(morph);
        morph.key = toNextKey();
        regarding({ about: 'be-replaced-morph', key, morph });
    }

    whenToggled: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, isEnabled: e.currentTarget.checked }));
    };
    whenChangedSize: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, windowSize: parseInt(e.currentTarget.value, 10) }));
    };
    render() {
        const { morph: { isEnabled, windowSize, key }, regarding } = this.props;
        return <div className="morph">
            <div className="morph-name">
                <label><input type="checkbox" checked={isEnabled} onChange={this.whenToggled} /> dynamic threschold</label> <span>
                    <UpDown context={key} regarding={regarding} />
                </span>
            </div>
            <div className="morph-props">
                window size: <input type="number" className="morph-number" value={windowSize} onChange={this.whenChangedSize} />
            </div>
        </div>;
    }
}

