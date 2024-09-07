import React, { ChangeEventHandler } from 'react';
import { BeReplacedConfigConcern, UpDown } from './editing-configs';
import { DynamicThrescholdMorphConfig } from './morphs';
import { Regarding } from './reacting';

export type DynamicThrescholdMorphEditorConcern =
    | BeReplacedConfigConcern<DynamicThrescholdMorphConfig>
    | typeof UpDown.Concern;

export interface DynamicThrescholdMorphEditorProps {
    config: DynamicThrescholdMorphConfig;
    regarding: Regarding<DynamicThrescholdMorphEditorConcern>;
}

export class DynamicThrescholdMorphEditor extends React.PureComponent<DynamicThrescholdMorphEditorProps> {

    static Concern: DynamicThrescholdMorphEditorConcern;

    transform = (change: (morph: DynamicThrescholdMorphConfig) => DynamicThrescholdMorphConfig) => {
        let { config, regarding } = this.props;
        config = change(config);
        regarding({ about: 'be-replaced-config', config });
    }

    whenToggled: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, isEnabled: e.currentTarget.checked }));
    };
    whenChangedDynamicSize: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, dynamicWindowSize: parseInt(e.currentTarget.value, 10) }));
    };
    whenChangedGaussSize: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, gaussKernelSize: parseInt(e.currentTarget.value, 10) }));
    };
    whenChangedMinDynamicRange: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, minDynamicRange: parseInt(e.currentTarget.value, 10) }));
    };
    whenChangedShouldUseMinDynamicRange: ChangeEventHandler<HTMLInputElement> = e => {
        this.transform(morph => ({ ...morph, shouldUseMinDynamicRange: e.currentTarget.checked }));
    };

    render() {
        const { config, regarding } = this.props;
        const { isEnabled, dynamicWindowSize, gaussKernelSize, minDynamicRange, shouldUseMinDynamicRange, key } = config;
        return <div className="morph">
            <div className="morph-name">
                <label><input type="checkbox" checked={isEnabled} onChange={this.whenToggled} /> dynamic threschold</label> <span>
                    <UpDown context={key} regarding={regarding} />
                </span>
            </div>
            <div className="morph-props">
                gauss window size: <input type="number" step="2" className="morph-number" value={gaussKernelSize} onChange={this.whenChangedGaussSize} />
            </div>
            <div className="morph-props">
                dynamic window size: <input type="number" step="2" className="morph-number" value={dynamicWindowSize} onChange={this.whenChangedDynamicSize} />
            </div>
            <div className="morph-props">
                min dynamic range: <input type="number" step="1" className="morph-number" value={minDynamicRange} onChange={this.whenChangedMinDynamicRange} />
            </div>
            <div className="morph-props">
                <label><input type="checkbox" checked={shouldUseMinDynamicRange} onChange={this.whenChangedShouldUseMinDynamicRange} /> Min dynamic range?</label>
            </div>
        </div>;
    }
}

