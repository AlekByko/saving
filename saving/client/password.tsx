import React, { ChangeEventHandler } from 'react';
import ReactDOM from 'react-dom';
import { to } from './shared/core';

interface Familiy {
    key: string;
    weight: number;
    letters: string;
}

interface PasswordGeneratorFamilyProps {
    family: Familiy,
    onDone: (family: Familiy) => void;
}

interface State {
    weight: string;
    letters: string;
}

class PasswordGeneratorFamily extends React.Component<PasswordGeneratorFamilyProps, State>{

    state = to<State>({
        letters: this.props.family.letters,
        weight: this.props.family.weight.toString(),
    });

    whenChangedWeight: ChangeEventHandler<HTMLInputElement> = e => {
        this.setState({ weight: e.currentTarget.value });
    };

    whenChangedLetters: ChangeEventHandler<HTMLInputElement> = e => {
        this.setState({ letters: e.currentTarget.value });
    }

    render() {
        const { weight, letters } = this.state;
        return <div>
            <input value={weight} onChange={this.whenChangedWeight} /> <input value={letters} onChange={this.whenChangedLetters} />
        </div>;
    }
}

export interface PasswordGeneratorProps {
    families: Familiy[];
}
export class PasswordGenerator extends React.PureComponent<PasswordGeneratorProps> {
    render() {
        const { families } = this.props;
        return <div>
            {families.map(family => {
                return <PasswordGeneratorFamily key={family.key} family={family} onDone={family => {
                    console.log(family);
                }} />;
            })}
        </div>
    }
}



if (window.isSandbox) {
    class App extends React.Component<{}, PasswordGeneratorProps> {
        state = to<PasswordGeneratorProps>({
            families: [
                { key: 'lows', weight: 3, letters: 'abcdefghijklmnopqrstuvwxyz' },
                { key: 'caps', weight: 1, letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
                { key: 'digits', weight: 2, letters: '0123456789' },
                { key: 'punct', weight: 1, letters: '$@#!%^&*_' },
            ],
        });
    }
    const element = document.createElement('div');
    document.body.appendChild(element);
    ReactDOM.render(<App />, element);

}
