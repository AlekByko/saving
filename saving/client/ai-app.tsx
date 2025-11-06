import React, { ChangeEventHandler, MouseEventHandler } from 'react';


export interface AiAppProps {
    text: string;
    onTested: (text: string) => void;
}
export function thusAiApp() {

    interface State {
        text: string;
    }

    return class AiApp extends React.Component<AiAppProps, State> {

        static Props: AiAppProps;

        whenChangingText: ChangeEventHandler<HTMLTextAreaElement> = _e => {
            const text = _e.currentTarget.value;
            this.setState(state => {
                return { ...state, text } satisfies State;
            });
        };

        whenTesting: MouseEventHandler<HTMLButtonElement> = _e => {
            const { text } = this.state;
            const { onTested } = this.props;
            onTested(text);
        };

        makeState(): State {
            const { text } = this.props;
            return { text };
        }

        state = this.makeState();

        render() {
            const { text } = this.state;
            return <div>
                <div>
                    <textarea onChange={this.whenChangingText} value={text}></textarea>
                </div>
                <div>
                    <button onClick={this.whenTesting}>Test</button>
                </div>
            </div>;
        }
    };
}
