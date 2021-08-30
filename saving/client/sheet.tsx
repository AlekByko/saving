import * as React from 'react';
import { PropsOf } from './reacting';
import { asDefinedOr, isNull } from './shared/core';

export type LikeSheetDefs<Defs> = { [K in keyof Defs]: React.ComponentClass<any> };
export type SheetProps<Defs extends LikeSheetDefs<Defs>> = { [K in keyof Defs]: PropsOf<Defs[K]>; };

export function thusSheet<Defs extends LikeSheetDefs<Defs>>(defs: Defs, keys: (keyof Defs)[]) {
    type Props = SheetProps<Defs>;
    return class Sheet extends React.Component<Props> {
        static Props: Props;
        render() {
            return <div className="sheet">
                {keys.map(key => {
                    const Fact = defs[key];
                    const fact = this.props[key];
                    return <Fact key={'' + key} {...fact as any} />;
                })}
            </div>;
        }
    };
}

export interface HtmlFactProps<T> { value: T; }
export function thusHtmlFactOf<T>(format: (value: T) => string) {
    return class NamedText extends React.Component<HtmlFactProps<T>> {
        render() {
            const { value } = this.props;
            const html = format(value);
            if (html === '') return null;
            return <div className="fact as-html">
                <iframe ref={self => {
                    if (isNull(self)) return;
                    const document = self.contentDocument!;
                    document.open();
                    document.write(html);
                    document.close();
                }} />
            </div>;
        }
    };
}

export function thusNamedText(name: string) {
    return thusNamedValueOf<string>(name, x => x);
}

export function thusNamedTextOrUndefined(name: string) {
    return thusNamedValueOf<string | undefined>(name, value => asDefinedOr(value, ''));
}


export interface NamedValueProps<T> { value: T; }
export function thusNamedValueOf<T>(name: string, format: (value: T) => string) {
    return class NamedValue extends React.Component<NamedValueProps<T>> {
        render() {
            const { value } = this.props;
            const formatted = format(value).trim();
            if (formatted === '') return null;
            return <div className="fact">
                <div className="fact-name">{name}</div>
                <div className="fact-value">{formatted}</div>
            </div>;
        }
    };
}
