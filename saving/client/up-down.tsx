import React, { MouseEventHandler } from 'react';
import { Regarding } from './reacting';

export interface UpDownProps<Context, UpConcern, DownConcern> {
    context: Context;
    regarding: Regarding<UpConcern | DownConcern>;
}

export function thusUpDown<Context, UpConcern, DownConcern>(
    defualts: {
        makeUp: (context: Context) => UpConcern,
        makeDown: (context: Context) => DownConcern,
    }
) {
    const { makeUp, makeDown } = defualts;
    type Props = UpDownProps<Context, UpConcern, DownConcern>;
    type Concern = UpConcern | DownConcern;
    return class UpDown extends React.PureComponent<Props>{
        static Props: Props;
        static Concern: Concern;

        whenUp: MouseEventHandler<HTMLAnchorElement> = e => {
            e.stopPropagation();
            e.preventDefault();
            const concern = makeUp(this.props.context);
            this.props.regarding(concern);
        };
        whenDown: MouseEventHandler<HTMLAnchorElement> = e => {
            e.stopPropagation();
            e.preventDefault();
            const concern = makeDown(this.props.context);
            this.props.regarding(concern);
        };
        render() {
            return <>
                <a className="off" href="#" onClick={this.whenUp}>up</a>
                <a className="off" href="dowm" onClick={this.whenDown}>down</a>
            </>
        }
    }
}
