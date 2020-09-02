import React from 'react';
import { WordReference } from 'common/models';
import BubbleChartHelper from 'common/view/BubbleChart';
import { observer } from 'mobx-react';

interface Props {
    data: ReadonlyArray<WordReference>;
    height: number;
}

type Breakpoint = {
    id: number,
    mediaQuery: string,
    width: number,
    height: number,
};

const borderColor: string = '#77699D';

@observer
export default class BubbleCHart extends React.Component<Props, Breakpoint> {
    mounted: boolean;

    private _Breakpoint: Breakpoint = {
        id: 666,
        mediaQuery: '',
        width: 1440,
        height: 800,
    };
    private _rem: number = this.calcRem(window.innerWidth, window.innerWidth, this._Breakpoint);

    private _chart = new BubbleChartHelper(39 * this._rem, 100 * this._rem);

    private _svgRef: React.RefObject<SVGSVGElement> = React.createRef();
    private _chartWidth: number;

    constructor(props: Readonly<Props>) {
        super(props);
        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
        this._chartWidth = this._svgRef.current.getBoundingClientRect().width;
        this._chart.onResize(this.props.height * this._rem, this._chartWidth);
        this._chart.restartSimulation(this.props.data);
    }

    componentWillUnmount() {
        this.mounted = false;
        this._chart.endSimulation();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.data !== prevProps.data || this.props.data.length !== prevProps.data.length) {
            this._chart.onResize(this.props.height * this._rem, this._chartWidth);
            this._chart.restartSimulation(this.props.data);
        }
    }

    calcRem(width: number, height: number, breakpoint: Breakpoint) {
        const ab = breakpoint.width / breakpoint.height;
        const avp = width / height;

        const rem = ab < avp
            ? (height / breakpoint.height)
            : (width / breakpoint.width);

        return rem;
    }

    renderBubbles = () => {
        const { rendersCount, nodeData } = this._chart;

        const skipRenders = 10;
        if (rendersCount <= skipRenders) {
            return null;
        }

        // render circle and text elements inside a group
        const bubbles = nodeData.map((item, index) => {
            let fontSize = item.r * 0.3;

            if (item.value.length > 12) {
                fontSize *= 0.6;
            } else if (item.value.length > 8) {
                fontSize *= 0.67;
            }

            const words = item.value.split(' ');
            const categories = item.categories.join(', ');

            return (
                <g
                    key={index}
                    transform={`translate(${item.x}, ${item.y})`}
                >
                    <title>{categories || ''}</title>
                    <circle
                        r={item.r}
                        strokeWidth="1"
                        fill="#ffff"
                        stroke={item.r > 50 * this._rem ? borderColor : 'rgba(160, 157, 166, 0.25)'}
                    />
                    <text
                        dy={words.length > 1 ? -(words.length * fontSize) / 2 : fontSize / 2}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fontSize={`${fontSize}px`}
                        fontWeight="normal"
                        fontFamily="Helvetica-Neue"
                        fill={item.r > 50 * this._rem ? '#170F2E' : '#A09DA6'}
                    >
                        {words.map((word, i) => {
                            const dy = () => {
                                let num = 0;

                                if (words.length > 1) {
                                    num = i + fontSize;
                                } else {
                                    num = fontSize / 2;
                                    if (item.count > 1) {
                                        num = fontSize / 4;
                                    }
                                }

                                if (words.length > 1 && i === 0) {
                                    num = -(fontSize / 4);
                                }

                                if (words.length > 2 && i === 0) {
                                    num = -(fontSize / 2);
                                }

                                if (words.length > 3 && i === 0) {
                                    num = -fontSize;
                                }

                                return num;
                            };
                            return (<tspan
                                key={i + word}
                                dy={dy()}
                                textAnchor="middle"
                                x="0"
                            >
                                {item.r > 30 * this._rem && word}
                            </tspan>);
                        },
                        )}
                    </text>
                    <text
                        dy={words.length * fontSize}
                        fill="#A09DA6"
                        textAnchor="middle"
                        fontSize={`${fontSize * 0.6}px`}
                        fontWeight="normal"
                        fontFamily="Helvetica-Neue"
                    >
                        {item.r > 50 * this._rem && item.count > 1 && item.count + ' TIMES'}
                    </text>

                </g>
            );
        });

        return bubbles;
    }

    render() {
        if (!this._chart) {
            return null;
        }
        // TODO no rerenders after this._chart.rendersCount change
        return (
            <svg height={this.props.height * this._rem} width="100%" ref={this._svgRef}>
                {this.renderBubbles()}
            </svg>
        );
    }
}
