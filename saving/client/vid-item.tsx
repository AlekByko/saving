import React, { ChangeEventHandler, LegacyRef, MouseEventHandler } from 'react';
import { isNonNull, isNull } from '../shared/core';
import { addClassIf } from './reacting';

export interface VidPromptSettings {
    template: string;
    prompt: string;
    seed: number;
}
export interface VidItemProps {
    isSelected: boolean;
    file: FileSystemFileHandle;
    onToggled: (filename: string) => void;
    onRequestedPromptSettings: (filename: string) => Promise<VidPromptSettings | null>;
    onDeleting: (filename: string) => void;
}
export function thusVidItem() {
    interface State {
        settings: VidPromptSettings | null;
    }
    function makeState(): State {
        return { settings: null };
    }
    return class VidItem extends React.PureComponent<VidItemProps, State> {

        static Props: VidItemProps;
        state = makeState();

        whenSelectingItem: ChangeEventHandler<HTMLInputElement> = () => {
            this.props.onToggled(this.props.file.name);
        };

        whenVideoElement: LegacyRef<HTMLVideoElement> = async element => {
            if (isNull(element)) return;
            if (element.src !== '') return;
            if (this.isLoading) return;
            this.isLoading = true;
            const { file } = this.props;
            const blob = await file.getFile();
            const url = URL.createObjectURL(blob);
            this.videoUrl = element.src = url;
            element.controls = true;
            this.isLoading = false;
        };

        private videoUrl: string | null = null;
        private isLoading = false;
        whenRequestingPrompt: MouseEventHandler<HTMLButtonElement> = async _e => {
            const filename = this.props.file.name;
            const settings = await this.props.onRequestedPromptSettings(this.props.file.name);
            if (isNull(settings)) return console.log(`No prompt settings for ${filename}.`);
            this.setState({ settings });
        };
        whenDeleting: MouseEventHandler<HTMLButtonElement> = _e => {
            if (!confirm(`Are you sure?`)) return;
            this.props.onDeleting(this.props.file.name);
        };

        whenClosing: MouseEventHandler<HTMLButtonElement> = _e => {
            this.setState({ settings: null });
        };

        componentWillUnmount(): void {
            const { videoUrl } = this;
            if (isNonNull(videoUrl)) {
                URL.revokeObjectURL(videoUrl);
                this.videoUrl = null;
            }
        }

        render() {
            const { settings } = this.state;
            const { isSelected, file: { name } } = this.props;
            return <div className={'vid-item' + addClassIf(isSelected, 'as-selected')}>
                <div className="vid-item-name-and-tools">
                    <label title={isSelected ? 'Deselect' : 'Select'}>
                        <input type="checkbox" checked={isSelected} onChange={this.whenSelectingItem} /> {name}
                    </label>
                    <div className="vid-item-tools">
                        <button onClick={this.whenRequestingPrompt}>Prompt</button>
                        <button onClick={this.whenDeleting}>Delete</button>
                    </div>
                </div>
                <div className="vid-item-vid">
                    <video ref={this.whenVideoElement} />
                    {(() => {
                        if (isNull(settings)) return null;
                        const { seed, prompt, template } = settings;
                        return <div className="vid-prompt-settings">
                            <div className="vid-prompt-seed-and-tools">
                                <input className="vid-prompt-seed" defaultValue={seed} />
                                <div className="vid-prompt-tools">
                                    <button>Copy</button>
                                    <button onClick={this.whenClosing}>Close</button>
                                </div>
                            </div>
                            <textarea className="vid-prompt-template" rows={10}>{template}</textarea>
                            <textarea className="vid-prompt-prompt">{prompt}</textarea>
                        </div>;
                    })()}
                </div>
            </div>;
        }
    };
}
