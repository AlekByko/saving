import d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';
import { isNull } from './shared/core';

export interface TrackedNumberChartProps<Item> {
    items: Item[];
}

export function thusTrackedNumberChart<Item>(
    defaults: {
        width: number;
        height: number;
        xOf: (item: Item, index: number) => number;
        yOf: (item: Item, index: number) => number;
    }
) {
    const { width, height, xOf, yOf } = defaults;

    type Props = TrackedNumberChartProps<Item>;

    return class TrackedNumberChart extends React.Component<Props> {

        static Props: Props;

        containerElement: SVGSVGElement | null = null;
        componentDidUpdate(): void {
            this.doDrawing();
        }
        componentDidMount(): void {
            this.doDrawing();
        }
        doDrawing() {

            const { containerElement } = this;
            if (isNull(containerElement)) return;

            const { items } = this.props;

            const x = d3.scaleUtc(d3.extent(items, (d, i) => xOf(d, i)) as any, [0, width]);

            const y = d3.scaleLinear([d3.min(items, (d, i) => yOf(d, i)), d3.max(items, (d, i) => yOf(d, i)) as any], [height, 0]);

            const line = d3.line<Item>()
                .x((d, i) => x(xOf(d, i)))
                .y((d, i) => y(yOf(d, i)));

            const svg = d3.select(containerElement)
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

            svg.selectAll("*").remove(); // <-- clear previous

            svg.append("path")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", line(items));
        }
        render() {
            return <svg ref={el => this.containerElement = el}></svg>;
        }
    };
}

if (window.sandbox === 'tracked-number-chart') {
    const rootElement = document.getElementById('root')!;
    interface Item {
        delta: number;
    }
    const Chart = thusTrackedNumberChart<Item>({
        height: 50,
        width: 200,
        xOf: (_x, i) => i,
        yOf: (d, _i) => d.delta,
    });
    const items: Item[] = [{ delta: 0.5 }, { delta: 0.1 }, { delta: 0.28 }, { delta: 0.64 }];
    ReactDOM.render(<Chart items={items} />, rootElement);
}
