import React, { ChangeEventHandler, LegacyRef, MouseEventHandler } from 'react';
import { isNonNull, isNull } from '../shared/core';
import { addClassIf } from './reacting';

export interface VidItemProps {
    isSelected: boolean;
    file: FileSystemFileHandle;
    onToggled: (filename: string) => void;
    onRequestedPrompt: (filename: string) => Promise<any>;
}
export function thusVidItem() {
    return class VidItem extends React.PureComponent<VidItemProps> {

        static Props: VidItemProps;

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
            const json = await this.props.onRequestedPrompt(this.props.file.name);
            console.log(json);
        };

        componentWillUnmount(): void {
            const { videoUrl } = this;
            if (isNonNull(videoUrl)) {
                URL.revokeObjectURL(videoUrl);
                this.videoUrl = null;
            }
        }

        render() {
            const { isSelected, file: { name } } = this.props;
            return <div className={'vid-item' + addClassIf(isSelected, 'as-selected')}>
                <div className="vid-item-tools">
                    <label>{name}</label>
                    <label>
                        <input type="checkbox" checked={isSelected} onChange={this.whenSelectingItem} /> Select
                    </label>
                    <button onClick={this.whenRequestingPrompt}>Prompt</button>
                </div>
                <div>
                    <video ref={this.whenVideoElement} />
                </div>
            </div>;
        }
    };
}
