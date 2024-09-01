import React, { ChangeEventHandler } from 'react';
import { BeReplacedMorphConcern, UpDown } from './editing-morphs';
import { MaxVotingMorph } from './morphs';
import { Regarding, toNextKey } from './reacting';

export type MaxVotingMorphEditorConcern =
    | BeReplacedMorphConcern<MaxVotingMorph>
    | typeof UpDown.Concern;

export interface MaxVotingMorphEditorProps {
    morph: MaxVotingMorph;
    regarding: Regarding<MaxVotingMorphEditorConcern>;
}

export class MaxVotingMorphEditor extends React.PureComponent<MaxVotingMorphEditorProps> {

    static Concern: MaxVotingMorphEditorConcern;

    transform = (change: (morph: MaxVotingMorph) => MaxVotingMorph) => {
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
                <label><input type="checkbox" checked={isEnabled} onChange={this.whenToggled} /> max voting</label> <span>
                    <UpDown context={key} regarding={regarding} />
                </span>
            </div>
            <div className="morph-props">
                window size: <input className="morph-number" type="number" value={windowSize} onChange={this.whenChangedSize} />
            </div>
        </div>;
    }
}

