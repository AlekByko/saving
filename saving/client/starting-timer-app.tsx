import React from 'react';
import ReactDOM from 'react-dom';
import { readReg } from '../shared/reading-basics';

if (window.sandbox === 'starting-timer-app') {
    async function run() {
        const rootElement = document.getElementById('root')!;
        const App = thusTimerApp();
        ReactDOM.render(<App />, rootElement);
    }

    run();


    const text = '- 4:35 + 2m started';

    const parsed = readReg(text, 0, /-\s+(\d+):(\d+)\s+(.+)/, ([_full, hour, minute, text]) => {
        return { hour, minute, text };
    });
    console.log(parsed);

}

function thusTimerApp() {
    return class TimerApp extends React.Component {
        render() {
            return <div>
                <div>
                    <textarea rows={40} cols={100}></textarea>
                </div>
            </div>;
        }
    };
}

