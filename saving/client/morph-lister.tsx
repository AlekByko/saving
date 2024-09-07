import React from 'react';
import { DynamicThrescholdMorphEditor } from './dynamic-threschold-morph-editor';
import { GaussBlurMorphEditor } from './gauss-blur-morph-editor';
import { HorzVertBitHistoMorphEditor } from './horz-vert-bit-histo-morph-editor';
import { MaxVotingMorphEditor } from './max-voting-morph-editor';
import { MorphConfig } from './morphs';
import { Regarding } from './reacting';
import { broke } from './shared/core';
import { WeighedGrayMorphEditor } from './weighed-gray-morph-editor';

export type MorphListerConcern =
    | typeof WeighedGrayMorphEditor.Concern
    | typeof GaussBlurMorphEditor.Concern
    | typeof DynamicThrescholdMorphEditor.Concern
    | typeof MaxVotingMorphEditor.Concern
    | typeof HorzVertBitHistoMorphEditor.Concern;

export interface MorphListerProps {
    morphs: MorphConfig[];
    regarding: Regarding<MorphListerConcern>;
}

export class MorphLister extends React.PureComponent<MorphListerProps> {

    render() {
        const { morphs, regarding } = this.props;
        return <div className="morph-flow">
            {morphs.map(morph => {
                const { key } = morph;
                switch (morph.kind) {
                    case 'weighed-gray-morph': return <WeighedGrayMorphEditor key={key} config={morph} regarding={regarding} />;
                    case 'gauss-blur-morph': return <GaussBlurMorphEditor key={key} config={morph} regarding={regarding} />;
                    case 'dynamic-threschold-morph': return <DynamicThrescholdMorphEditor key={key} config={morph} regarding={regarding} />;
                    case 'max-voting-morph': return <MaxVotingMorphEditor key={key} config={morph} regarding={regarding} />;
                    case 'horz-vert-bit-histo-morph': return <HorzVertBitHistoMorphEditor key={key} config={morph} regarding={regarding} />;
                    default: return broke(morph);
                }
            })}
        </div>;
    }
}
