import * as React from 'react';
import * as ReactDom from 'react-dom';
import { isNull } from './core';
import { Regarding } from './reacting';
import { EntryInfo, willReadDir } from "./reading-files-from-browser-index-page";

export type FileSystemerConcern =
    | { about: 'be-picked-link'; link: string; };

export interface FileSystemerProps {
    entries: EntryInfo[];
    regarding: Regarding<FileSystemerConcern>;
}

export class App extends React.Component<FileSystemerProps> {
    private whenClicked = (e: React.MouseEvent<HTMLElement>) => {
        const clicked = e.target as HTMLElement;
        const link = clicked.getAttribute('data-link');
        if (isNull(link)) return;
        this.props.regarding({ about: 'be-picked-link', link });
    }
    render() {
        const { entries } = this.props;
        return <div onClick={this.whenClicked}>
            <ul>
                {entries.filter(x => x.type === 'dir').map(x => {
                    return <li key={x.name}><a data-link={x.link}>{x.name}</a></li>;
                })}
            </ul>
            <ul>
                {entries.filter(x => x.type === 'file').map(x => {
                    return <li key={x.name}><a data-link={x.link}>{x.name}</a></li>;
                })}
            </ul>
        </div>;
    }
}

async function run() {
    const entries = await willReadDir(href => href.replace('test.html', ''));
    const container = document.getElementById('root')!;
    const props: FileSystemerProps = { entries, regarding: link => { console.log(link); } };
    ReactDom.render(<App {...props} />, container);
}

run();
