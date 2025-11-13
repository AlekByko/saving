import React, { FormEventHandler, MouseEventHandler } from 'react';
import { isNull } from '../shared/core';
import { NoteKey } from './notes-workspace';
import { Box } from './reading-query-string';
import { Resizable } from './resizable';
import { TextDrop } from './text-drop';

const plainTextOnly = 'plaintext-only' as never;

export interface NoteProps {
    /** cannot be just `key` because React */
    noteKey: NoteKey;
    drop: TextDrop;
    box: Box;
    title: string;
    onChangedBox: (key: NoteKey, box: Partial<Box>) => void;
    onChangedTitle: (key: NoteKey, title: string) => void;
}


interface State { text: string; title: string; }

function makeState(props: NoteProps): State {
    const { title } = props;
    return { text: 'Loading...', title };
}

export function enableMoving<Pos>(
    headerElement: HTMLElement,
    contentElement: HTMLElement,
    defaults: {
        readPos: (element: HTMLElement) => Pos;
        applyDelta: (element: HTMLElement, pos: Pos, dx: number, dy: number) => void;
        reportPos: (pos: Pos, dx: number, dy: number) => void;
    },
) {

    function whenMousedown(e: MouseEvent) {
        const startX = e.pageX;
        const startY = e.pageY;
        const startPos = defaults.readPos(contentElement);

        document.addEventListener('mousemove', whenMousemove);
        document.addEventListener('mouseup', whenMouseup);

        function whenMouseup(e: MouseEvent) {
            document.removeEventListener('mouseup', whenMouseup);
            document.removeEventListener('mousemove', whenMousemove);
            const dx = e.pageX - startX;
            const dy = e.pageY - startY;
            defaults.reportPos(startPos, dx, dy);
        }

        function whenMousemove(e: MouseEvent) {
            const dx = e.pageX - startX;
            const dy = e.pageY - startY;
            defaults.applyDelta(contentElement, startPos, dx, dy);
        }
    }

    headerElement.addEventListener('mousedown', whenMousedown);

    return function dispose() {
        headerElement.removeEventListener('mousedown', whenMousedown);
    };
}

export function thusNote() {
    return class Note extends React.Component<NoteProps, State> {

        state = makeState(this.props);

        whenChangedContent: FormEventHandler<HTMLDivElement> = async e => {
            const { currentTarget: { innerText } } = e;
            // console.log(innerText);
            const { drop } = this.props;
            await drop.willOverwrite(innerText);
        };

        whenChangedBox = (box: Partial<Box>) => {
            const { noteKey } = this.props;
            this.props.onChangedBox(noteKey, box)
        };

        private headerElement: HTMLDivElement | null = null;
        private contentElement: HTMLElement | null = null;

        dispose = [] as Act[];

        whenChangingTitle: MouseEventHandler<HTMLDivElement> = _e => {
            this.setState(state => {
                const { title: olderTitle } = state;
                const newerTitle = prompt('Title', olderTitle);
                if (isNull(newerTitle)) return null;
                return { ...state, title: newerTitle } satisfies State;
            }, () => {
                const { noteKey, onChangedTitle } = this.props;
                const { title } = this.state;
                onChangedTitle(noteKey, title);
            });

        };

        async componentDidMount(): Promise<void> {
            const { contentElement, headerElement } = this;
            if (isNull(contentElement) || isNull(headerElement)) return;
            const { x, y, width, height } = this.props.box;
            contentElement.style.left = x + 'px';
            contentElement.style.top = y + 'px';
            contentElement.style.width = width + 'px';
            contentElement.style.height = height + 'px';
            this.dispose.push(...[
                enableMoving(headerElement, contentElement, {
                    readPos: element => {
                        const { top, left } = element.getBoundingClientRect();
                        return { top, left };
                    },
                    applyDelta: (element, { top, left }, dx, dy) => {
                        element.style.left = (left + dx) + 'px';
                        element.style.top = (top + dy) + 'px';
                    },
                    reportPos: ({ left: x, top: y }, dx, dy) => {
                        x += dx;
                        y += dy;
                        const { noteKey } = this.props;
                        this.props.onChangedBox(noteKey, { y, x });
                    },
                }),
            ]);


            const { drop } = this.props;
            const text = await drop.willLoad();
            if (isNull(text)) {
                this.setState({ text: 'Not there...' });
            } else {
                this.setState({ text });
            }
        }

        componentWillUnmount(): void {
            this.dispose.forEach(dispose => dispose());
        }

        render() {
            const { noteKey, drop, box } = this.props;
            const { title, text } = this.state;
            const where = `${drop.dir.name}/${drop.filename}`;
            return <Resizable key={noteKey} refin={el => this.contentElement = el} className="note" onChanged={this.whenChangedBox} box={box}>
                <div className="note-header" ref={el => this.headerElement = el} title={where} onDoubleClick={this.whenChangingTitle}>{title}</div>
                <div
                    className="note-content"
                    contentEditable={plainTextOnly}
                    onInput={this.whenChangedContent}>{text}</div>
            </Resizable>;
        }
    };
}
