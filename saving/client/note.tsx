import React, { FormEventHandler, UIEventHandler } from 'react';
import { isNonNull, isNull } from '../shared/core';
import { thusBoxed } from './boxed';
import { startListening } from './eventing';
import { CardKey, NoteBox } from './notes-workspace';
import { debounceOver } from './scheduling';
import { TextDrop } from './text-drop';

const plainTextOnly = 'plaintext-only' as never;

export interface NoteProps {
    /** cannot be named just `key` because React */
    noteKey: CardKey;
    drop: TextDrop;
    box: NoteBox;
    title: string;
    onChangedBox: (key: CardKey, box: Partial<NoteBox>) => void;
    onChangedTitle: (key: CardKey, title: string) => void;
    onDeleting: (key: CardKey) => void;
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

export interface NoteDefaults {
    makeInsert: (e: KeyboardEvent) => Node | null;
}
export function thusNote(defaults: NoteDefaults) {

    const Boxed = thusBoxed({
        boxOf: (props: NoteProps) => props.box,
        titleOf: props => props.title,
        onChangedBox: (props, box) => props.onChangedBox(props.noteKey, box),
        onChangedTitle: (props, title) => props.onChangedTitle(props.noteKey, title),
        onDeleting: props => props.onDeleting(props.noteKey),
    });

    return class Note extends React.Component<NoteProps, State> {

        state = makeState(this.props);

        whenChangedContent: FormEventHandler<HTMLDivElement> = async e => {
            const { currentTarget: { innerText } } = e;
            // console.log(innerText);
            const { drop } = this.props;
            await drop.willOverwrite(innerText);
        };

        private textElement: HTMLElement | null = null;

        dispose = [] as Act[];

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

        async componentDidMount(): Promise<void> {
            const { textElement } = this;
            if (isNull(textElement)) return;
            const { scrollLeft, scrollTop } = this.props.box;

            this.dispose.push(startListening(textElement, 'mousedown', e => {
                e.stopPropagation();
            }));

            this.dispose.push(startListening(textElement, 'dblclick', e => {
                e.stopPropagation();
            }));

            this.dispose.push(startListening(textElement, 'keydown', e => {

                const node = defaults.makeInsert(e);
                if (isNonNull(node)) {
                    e.preventDefault();
                    e.stopPropagation();

                    const selection = window.getSelection();
                    if (isNull(selection)) return;
                    if (selection.rangeCount > 0) {
                        const olderRange = selection.getRangeAt(0);

                        olderRange.deleteContents();
                        olderRange.insertNode(node);

                        const newerRange = olderRange.cloneRange();
                        newerRange.setStartAfter(node);
                        newerRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newerRange);
                    }
                }
            }));

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
            const { text } = this.state;
            return <Boxed {...this.props}>
                <div
                    className="note-content"
                    ref={el => this.textElement = el}
                    contentEditable={plainTextOnly}
                    onScroll={this.whenScrolled}
                    onInput={this.whenChangedContent}>{text}</div>
            </Boxed>;
        }
    };
}
