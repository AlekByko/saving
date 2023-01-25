import React, { useState } from 'react';
import { Regarding } from './reacting';

export function thusNewText<Concern>(toConcern: (text: string) => Concern) {
    interface NewTextProps {
        className?: string;
        text: string;
        regarding: Regarding<Concern>;
    }
    return function NewText(props: NewTextProps) {
        const [text, setText] = useState(props.text);
        return <input
            value={text}
            size={10}
            className={props.className}
            onChange={e => setText(e.currentTarget.value)}
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    props.regarding(toConcern(text));
                    setText('');
                }
            }}
        />;
    };
}
