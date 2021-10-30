import React from 'react';
import { enableMoving } from './moving-by-mouse';
import { ReactConstructor } from './reacting';


export function thusConsole<Props>(Content: ReactConstructor<Props>) {
    return class Console extends React.PureComponent<Props> {
        private moving = enableMoving();
        render() {
            return <div ref={me => {
                this.moving.whenHandleElement(me);
                this.moving.whenRootElement(me);
            }} className="console">
                <Content {...this.props} />
            </div>;
        }
    }
}
