import React, { ChangeEventHandler, KeyboardEventHandler } from 'react';

export interface ParsableEditorProps<Value> {
    value: Value;
    onChanged: (value: Value) => void;
}

interface ParsableEditorState<Value> {
    text: string;
    lastValue: Value;
}

export function thusParsableEditor<Value, Parsed, Unparsed>(defaults: {
    format: (value: Value) => string;
    parse: (text: string) => Parsed | Unparsed;
    seeIfParsed: (parsedOrNot: Parsed | Unparsed) => parsedOrNot is Parsed;
    parsedValueOf: (parsed: Parsed) => Value;
}) {

    type Props = ParsableEditorProps<Value>;
    type State = ParsableEditorState<Value>;

    function makeState(props: Props): State {
        const { value } = props;
        return {
            text: defaults.format(value),
            lastValue: value,
        };
    }

    return class ParsableEditor extends React.Component<Props, State> {

        state = makeState(this.props);

        static Props: Props;

        static getDerivedStateFromProps(newerProps: Props, state: State): null | State {
            if (newerProps.value === state.lastValue) return null;
            return makeState(newerProps);
        }

        whenChanged: ChangeEventHandler<HTMLInputElement> = e => {
            const text = e.currentTarget.value;
            this.setState(state => {
                return { ...state, text } satisfies State;
            });
        }

        whenEntered: KeyboardEventHandler<HTMLInputElement> = e => {
            switch (e.key) {
                case 'Enter': {
                    const { text } = this.state;
                    const parsedOrNot = defaults.parse(text);
                    const isParsed = defaults.seeIfParsed(parsedOrNot);
                    if (!isParsed) return;

                    const value = defaults.parsedValueOf(parsedOrNot);
                    this.props.onChanged(value);
                }
            }
        };

        render() {
            const { text } = this.state;
            return <input type="text" onChange={this.whenChanged} size={0} value={text} />;
        }
    };
}
