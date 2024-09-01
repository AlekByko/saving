import React, { ChangeEventHandler } from 'react';
import { BeReplacedMorphConcern, UpDown } from './editing-morphs';
import { WeighedGrayMorph } from './morphs';
import { Regarding, toNextKey } from './reacting';

export type WeighedGrayMorphEditorConcern =
    | BeReplacedMorphConcern<WeighedGrayMorph>
    | typeof UpDown.Concern;

export interface WeighedGrayMorphEditorProps {
    morph: WeighedGrayMorph;
    regarding: Regarding<WeighedGrayMorphEditorConcern>;
}

export class WeighedGrayMorphEditor extends React.PureComponent<WeighedGrayMorphEditorProps> {

    static Concern: WeighedGrayMorphEditorConcern;

    transform = (change: (morph: WeighedGrayMorph) => WeighedGrayMorph) => {
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
    render() {
        const { morph: { key, isEnabled }, regarding } = this.props;
        return <div className="morph">
            <div className="morph-name">
                <label><input type="checkbox" checked={isEnabled} onChange={this.whenToggled} /> weighed gray</label> <span>
                    <UpDown context={key} regarding={regarding} />
                </span>
            </div>
            <div className="morph-props"></div>
        </div>;
    }
}
