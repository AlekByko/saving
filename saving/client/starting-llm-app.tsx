import React, { ChangeEventHandler, MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';
import { isNull } from '../shared/core';
import { formatTimestamp, toTimestamp } from '../shared/time-stamping';
import { Drop } from './drop';
import { knownNotesDirRef } from './file-system-entries';
import { willOpenKnownDb } from './known-database';
import { willTryLoadDirRef } from './reading-writing-files';

if (window.sandbox === 'starting-llm-app') {

    function exitLoud(text: string): never {
        console.log(text);
        alert(text);
        throw new Error(text);
    }


    async function run() {
        const db = await willOpenKnownDb();
        const notesDir = await willTryLoadDirRef(db, knownNotesDirRef);
        if (isNull(notesDir)) return exitLoud(`Unable to get dir for ${notesDir}.`);
        const now = toTimestamp();
        const when = formatTimestamp(now);
        const salt = (~~(Math.random() * 999)).toFixed(0).padStart(3, '0');
        const noteFilename = `chat-${when}-${salt}.txt`
        const drop = new Drop(notesDir, noteFilename);
        const loaded = await drop.willLoad();
        void loaded;
        // if (isNull(loaded)) return exitLoud(`Unable to load saved text.`);

        const rootElement = document.getElementById('root')!;



        interface State {
            answer: string;
            question: string;
            isThinking: boolean;
        }

        function makeState(): State {
            return { answer: '', question: '', isThinking: false };
        }

        class App extends React.Component<{}, State> {
            async willAdd(what: string, text: string) {
                const lines = [
                    ``,
                    `--- ${what} at ${new Date().toLocaleString()} ----------------------------`,
                    text,
                ];
                await drop.willAppend(lines.join('\n'));
            }
            state = makeState();

            whenAsking: MouseEventHandler<HTMLButtonElement> = async _e => {
                const { question } = this.state;
                this.setState({ isThinking: true });
                await this.willAdd('QUESTION', question);
                const answer = await willAsk(question);
                await this.willAdd('ANSWER', answer);
                this.setState({ answer, isThinking: false });
            };

            whenChangingQuestion: ChangeEventHandler<HTMLTextAreaElement> = e => {
                const question = e.currentTarget.value;
                this.setState({ question });
            };

            render() {
                const { question, answer, isThinking } = this.state;
                return <div>
                    <div>
                        <textarea cols={100} rows={40} disabled={true} defaultValue={answer}></textarea>
                    </div>
                    <div>
                        <textarea cols={100} rows={20} value={question} onChange={this.whenChangingQuestion}></textarea>
                    </div>
                    <div>
                        <button onClick={this.whenAsking} disabled={isThinking}>{isThinking ? 'Thinking...' : 'Ask'}</button>
                    </div>
                </div>
            }
        }
        ReactDOM.render(<App />, rootElement);
    }

    run();
}

async function willAsk(text: string) {
    const res = await fetch('http://localhost:8087/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'guanaco-13b-uncensored',
            messages: [
                { role: 'user', content: text },
            ],
            temperature: 0.7,
            max_tokens: 512,
            repeat_penalty: 1.3,
            stop: ['</s>', '<|im_end|>', 'User:', 'Assistant:']
        }),
    });

    const data = await res.json();
    console.log(data);
    const result = data.choices[0].message.content;
    return result;
}
