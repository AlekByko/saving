import React, { FormEventHandler, MouseEventHandler, UIEventHandler } from 'react';
import { isNull } from '../shared/core';
import { NoteBox, NoteKey } from './notes-workspace';
import { Resizable } from './resizable';
import { debounceOver } from './scheduling';
import { TextDrop } from './text-drop';

const plainTextOnly = 'plaintext-only' as never;

export interface NoteProps {
    /** cannot be named just `key` because React */
    noteKey: NoteKey;
    drop: TextDrop;
    box: NoteBox;
    title: string;
    onChangedBox: (key: NoteKey, box: Partial<NoteBox>) => void;
    onChangedTitle: (key: NoteKey, title: string) => void;
    onDeleting: (key: NoteKey) => void;
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
        e.stopPropagation();
        e.preventDefault();

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
            e.stopPropagation();
            e.preventDefault();
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

        whenChangedBox = (box: Partial<NoteBox>) => {
            const { noteKey } = this.props;
            this.props.onChangedBox(noteKey, box)
        };

        private headerElement: HTMLDivElement | null = null;
        private noteElement: HTMLElement | null = null;
        private textElement: HTMLElement | null = null;

        dispose = [] as Act[];

        whenChangingTitle: MouseEventHandler<HTMLDivElement> = e => {
            e.preventDefault();
            e.stopPropagation();
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

        /** at initilizing and mounting we don't want scroll to fire at all, we only let it fire after we set the saved scroll position */
        private shouldIgnoreScrollEvents = true;
        whenScrolledDebounced = debounceOver(500);
        whenScrolled: UIEventHandler<HTMLDivElement> = e => {
            if (this.shouldIgnoreScrollEvents) return;
            const { scrollLeft, scrollTop } = e.currentTarget;
            const { noteKey, onChangedBox } = this.props;
            this.whenScrolledDebounced(() => {
                onChangedBox(noteKey, { scrollLeft, scrollTop });
            });
        };
        whenDeleting: MouseEventHandler<HTMLButtonElement> = _e => {
            this.props.onDeleting(this.props.noteKey);
        }


        async componentDidMount(): Promise<void> {
            const { noteElement, headerElement, textElement } = this;
            if (isNull(noteElement) || isNull(headerElement) || isNull(textElement)) return;
            const { x, y, width, height, scrollLeft, scrollTop } = this.props.box;
            noteElement.style.left = x + 'px';
            noteElement.style.top = y + 'px';
            noteElement.style.width = width + 'px';
            noteElement.style.height = height + 'px';

            textElement.addEventListener('mousedown', e => {
                e.stopPropagation();
                console.log('stopped');
            });

            const nomoreMoving = enableMoving(headerElement, noteElement, {
                readPos: element => {
                    const childAt = element.getBoundingClientRect();
                    const parentAt = element.parentElement!.getBoundingClientRect();
                    const x = childAt.left - parentAt.left;
                    const y = childAt.top - parentAt.top;
                    return { x, y };
                },
                applyDelta: (element, { x, y }, dx, dy) => {
                    element.style.left = (x + dx) + 'px';
                    element.style.top = (y + dy) + 'px';
                },
                reportPos: ({ x, y }, dx, dy) => {
                    x += dx;
                    y += dy;
                    const { noteKey } = this.props;
                    this.props.onChangedBox(noteKey, { y, x });
                },
            });

            this.dispose.push(nomoreMoving);


            const { drop } = this.props;
            const text = await drop.willLoad();
            if (isNull(text)) {
                this.setState({ text: 'Not there...' });
            } else {
                this.setState({ text }, () => {
                    textElement.scrollTo({ top: scrollTop, left: scrollLeft, behavior: 'instant' });
                    this.shouldIgnoreScrollEvents = false;
                });
            }
        }

        componentWillUnmount(): void {
            this.dispose.forEach(dispose => dispose());
        }

        render() {
            const { noteKey, drop, box } = this.props;
            const { title, text } = this.state;
            const where = `${drop.dir.name}/${drop.filename}`;
            return <Resizable key={noteKey} refin={el => this.noteElement = el} className="note" onChanged={this.whenChangedBox} box={box}>
                <div className="note-header" ref={el => this.headerElement = el} title={where} onDoubleClick={this.whenChangingTitle}>{title}<button onClick={this.whenDeleting}>X</button></div>
                <div
                    className="note-content"
                    ref={el => this.textElement = el}
                    contentEditable={plainTextOnly}
                    onScroll={this.whenScrolled}
                    onInput={this.whenChangedContent}>{text}</div>
            </Resizable>;
        }
    };
}
