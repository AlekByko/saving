import React, { ChangeEventHandler } from 'react';
import { BeReplacedConfigConcern, UpDown } from './editing-morphs';
import { MaxVotingMorphConfig } from './morphs';
import { Regarding } from './reacting';

export type MaxVotingMorphEditorConcern =
    | BeReplacedConfigConcern<MaxVotingMorphConfig>
    | typeof UpDown.Concern;

export interface MaxVotingMorphEditorProps {
    config: MaxVotingMorphConfig;
    regarding: Regarding<MaxVotingMorphEditorConcern>;
}

export class MaxVotingMorphEditor extends React.PureComponent<MaxVotingMorphEditorProps> {

    static Concern: MaxVotingMorphEditorConcern;

    transform = (change: (morph: MaxVotingMorphConfig) => MaxVotingMorphConfig) => {
        let { config, regarding } = this.props;
        config = change(config);
        regarding({ about: 'be-replaced-config', config });
    }
    whenToggled: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, isEnabled: e.currentTarget.checked }));
    };
    whenChangedSize: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, windowSize: parseInt(e.currentTarget.value, 10) }));
    };
    render() {
        const { config: { isEnabled, windowSize, key }, regarding } = this.props;
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

