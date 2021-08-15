import * as React from 'react';
import { isNull } from './core';
import { insteadEach } from './each';
import { Point } from './geometry';

type LikeSurfaceDefs<Defs> = { [P in keyof Defs]: React.ComponentClass<any> };
interface FloatyProps<Key, Props> {
    defKey: Key;
    key: string;
    props: Props;
    at: () => Point;
}

type Floaty<Defs extends LikeSurfaceDefs<Defs>> = {
    [P in keyof Defs]: Defs[P] extends React.ComponentClass<infer Props> ? FloatyProps<P, Props> : never;
}[keyof Defs];

interface SurfaceProps<Defs extends LikeSurfaceDefs<Defs>> {
    floaties: Floaty<Defs>[];
}

const SurfaceContext = React.createContext<HTMLElement | null>(null);

export function thusSurface<Defs extends LikeSurfaceDefs<Defs>>(defs: Defs) {
    type Props = SurfaceProps<Defs>;

    function thusFloaty<Props>(Component: React.ComponentClass<Props>) {
        return class Floaty extends React.PureComponent<FloatyProps<keyof Defs, Props>> {
            static contextType = SurfaceContext;
            render() {
                const element = this.context as HTMLElement | null;
                if (isNull(element)) return null;
                const { at, props } = this.props;
                const { left: sx, top: sy } = element.getBoundingClientRect();
                const { x, y } = at();
                const styles: React.CSSProperties = { left: x - sx, top: y - sy };
                return <div className="floaty" style={styles}>
                    <Component {...props} />
                </div>;
            }
        };
    }

    const floatyDefs = insteadEach(defs, defKey => thusFloaty(defs[defKey]));
    class AllFloaties extends React.PureComponent<Props> {
        render() {
            const { floaties } = this.props;
            return floaties.map(floaty => {
                const { defKey, key } = floaty;
                const Floaty = floatyDefs[defKey];
                return <Floaty key={key} {...floaty as any} />;
            });
        }
    }
    return class Surface extends React.Component<Props> {
        static Props: Props;
        static Floaty: Floaty<Defs>;
        private element: HTMLElement | null = null;
        componentDidMount() {
            this.forceUpdate();
        }
        render() {
            const { element } = this;
            if (isNull(element)) {
                return <div ref={self => this.element = self} className="surface">
                    {this.props.children}
                </div>;
            } else {
                // @ts-expect-error
                return <SurfaceContext.Provider value={element}>
                    <div ref={self => this.element = self} className="surface">
                        {this.props.children}
                        <AllFloaties {...this.props} />
                    </div>
                </SurfaceContext.Provider>;
            }
        }
    };
}
