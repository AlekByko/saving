import React from 'react';
import ReactDOM from 'react-dom';

export interface State {
    text: string;
}
function thusTest(text: string) {
    return class Test extends React.Component<{}, State> {
        state = { text }
        render() {
            const { text } = this.state;
            return <a href="#" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                this.setState({ text: Math.random().toString() })
            }}>{text}</a>
        }
    }
}

function thusApp() {
    const Test1 = thusTest('a');
    const Test2 = thusTest('b');
    return class App extends React.Component<{}> {
        render(): React.ReactNode {
            return <div>
                {Math.random() ? <Test1 /> : <Test2 />}
                <div><button onClick={() => {
                    this.forceUpdate();
                }}>Toss</button></div>
            </div>;
        }
    }
}

if (window.sandbox === 'state-share') {
    const App = thusApp();
    const rootElement = document.getElementById('root');
    ReactDOM.render(<App />, rootElement);
}
