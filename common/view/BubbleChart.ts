import * as d3 from 'd3';
import { WordReference } from 'common/models';
import { observable, computed } from 'mobx';

interface BubleDataType extends WordReference, d3.SimulationNodeDatum {
    r?: number;
}

// IS THIS VIEW MODEL?
export default class BubbleCHart {
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;

    @observable
    private _rendersCount: number = 0;

    @observable.ref
    private _source: ReadonlyArray<WordReference>;

    private _height: number;
    private _width: number;
    private _minR: number;
    private _maxR: number;

    constructor(minR: number, maxR: number) {
        this._minR = minR;
        this._maxR = maxR;
    }

    get rendersCount() { return this._rendersCount; }

    @computed
    get nodeData() { return this.beginSimulation(); }

    public onResize = (height: number, width: number) => {
        this._height = height;
        this._width = width;
    }

    public restartSimulation = (data: ReadonlyArray<WordReference>) => {
        this.endSimulation();
        this._rendersCount = 0;
        this._source = data;
    }

    private beginSimulation = () => {
        if (!this._source || this._source.length <= 0) {
            return [];
        }

        const nodeData: BubleDataType[] = this._source
            .map(d => ({ value: d.value, count: d.count, categories: d.categories, sentiment: d.sentiment }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 100);

        // get min and max value
        const minValue = d3.min(nodeData, item => item.count);
        const maxValue = d3.max(nodeData, item => item.count);

        const targetS = this._width * this._height * 0.60;
        let currentS = 0;

        const radiusScale = d3
            .scaleLinear().clamp(true)
            // scaling
            .range([this._minR, this._maxR])// output range
            .domain([minValue, maxValue]); // input range

        // creating circle objects with coordinate fields
        const data: BubleDataType[] = nodeData
            .filter(d => {
                d.r = radiusScale(d.count);
                d.x = this._width / 2;
                d.y = this._height / 2;
                d.value = d.value.toUpperCase();
                currentS += Math.PI * d.r * d.r; // TODO plus gap?
                if (currentS > targetS) {
                    // hide item
                    d.r = 0;
                    d.value = '';
                    return false;
                }
                return true;
            });

        this.simulatePositions(data);

        return data;
    }

    public endSimulation = () => {
        if (this.simulation) {
            this.simulation.stop();
            this.simulation = null;
        }
    }

    private simulatePositions = (data: BubleDataType[]) => {
        const padding = 8;

        this.simulation = d3
            .forceSimulation()
            .nodes(data) // setting the coordinates of the obtained values
            .force('charge', d3.forceManyBody().strength(-3))
            .velocityDecay(0.5)
            .force('collision', d3.forceCollide()
                .radius((d: BubleDataType) => d.r + padding),
            )
            .on('tick', () => {
                data.forEach((d) => {
                    d.x = Math.max(d.r + 5, Math.min(this._width  - d.r - 5, d.x));
                    d.y = Math.max(d.r + 5, Math.min(this._height  - d.r - 5, d.y));
                }); // set boundaries bounding box

                this._rendersCount++;
            });
            this.simulation.alphaDecay(0.02);
    }
}
