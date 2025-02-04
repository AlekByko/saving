import d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';
import { isNull } from '../shared/core';

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
    let x = false;
    if (x) {
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
    } else {
        const canvas = document.createElement('canvas');
        rootElement.appendChild(canvas);
        const baseContext: BaseContext = {
            width: 200,
            height: 50,
            speed: 2,
            count: 100,
        };
        enableSnowFlaking(canvas, baseContext);
    }
}


function enableSnowFlaking(canvas: HTMLCanvasElement, baseContext: BaseContext) {
    canvas.width = baseContext.width;
    canvas.height = baseContext.height;
    const ctx = canvas.getContext('2d')!;
    const particles = initParticles(baseContext, baseContext.count);
    const context: Context = {
        ...baseContext,
        particles,
        ctx,
    };
    animate(context);
}

interface Particle {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    vx: number;
    vy: number;
    angle: number;
    swirlStrength: number;
}
interface BaseContext {
    width: number;
    height: number;
    speed: number;
    count: number;
}
interface Context extends BaseContext {
    ctx: CanvasRenderingContext2D;
    particles: Particle[];
}
function createParticle(context: BaseContext): Particle {
    const { width, height, speed } = context;
    return {
        x: Math.random() * width,   // Random horizontal start
        y: Math.random() * height,  // Start at random heights
        radius: Math.random() * 1 + 1,     // Size of particle
        opacity: Math.random() * 0.5 + 0.5,
        vx: -(Math.random() * speed + 0.5),  // Wind pushes left
        vy: Math.random() * 0.5 + 1,  // Falling down speed
        angle: Math.random() * Math.PI * 2,
        swirlStrength: Math.random() * 0.3 // Swirl intensity
    };
}

function initParticles(context: BaseContext, count: number): Particle[] {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
        particles.push(createParticle(context));
    }
    return particles;
}

function updateParticles(context: Context): void {
    const { particles, speed, height } = context;
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];

        // Simulate swirling effect by adjusting horizontal movement randomly
        p.angle += (Math.random() - 0.5) * 0.1;
        p.vx = -(speed + Math.cos(p.angle) * p.swirlStrength);
        p.vy += (Math.sin(p.angle) * 0.01); // Slight wobble

        p.x += p.vx;
        p.y += p.vy;

        // If the particle goes off screen, reset it at the top
        if (p.y > height || p.x < -10) {
            particles[i] = createParticle(context);
            particles[i].y = -10; // Respawn above the screen
        }
    }
}

function drawParticles(context: Context): void {
    const { ctx, width, height, particles } = context;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate(context: Context) {
    updateParticles(context);
    drawParticles(context);
    requestAnimationFrame(() => animate(context));
}
