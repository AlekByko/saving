import React, { ChangeEventHandler } from 'react';
import { BeReplacedConfigConcern, UpDown } from './editing-morphs';
import { WeighedGrayMorphConfig } from './morphs';
import { Regarding } from './reacting';

export type WeighedGrayMorphEditorConcern =
    | BeReplacedConfigConcern<WeighedGrayMorphConfig>
    | typeof UpDown.Concern;

export interface WeighedGrayMorphEditorProps {
    config: WeighedGrayMorphConfig;
    regarding: Regarding<WeighedGrayMorphEditorConcern>;
}

export class WeighedGrayMorphEditor extends React.PureComponent<WeighedGrayMorphEditorProps> {

    static Concern: WeighedGrayMorphEditorConcern;

    transform = (change: (morph: WeighedGrayMorphConfig) => WeighedGrayMorphConfig) => {
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
    render() {
        const { config: { key, isEnabled }, regarding } = this.props;
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
