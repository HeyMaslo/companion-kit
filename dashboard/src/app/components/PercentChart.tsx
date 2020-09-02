import React from 'react';
import gsap from 'gsap';
import { View } from 'app/common/components';

type ChartProps = {
    value: number;
    color?: string;
    pathes: string[][];
    loopDuration?: number;
};

export default class PercentChart extends React.Component<ChartProps> {
    _pathes: React.RefObject<any>[];

    constructor(props: ChartProps) {
        super(props);
        this._pathes = new Array();
        this.props.pathes.forEach(path => {
            this._pathes.push( React.createRef<SVGPathElement>());
        });
    }

    componentDidMount() {
        this.createTimeline();
    }

    createTimeline() {
        const { pathes, loopDuration } = this.props;
        this._pathes.forEach((pathRef, i) => {
            const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: i * 0.4 }).paused(true);
            const pathesArray = pathes[i];
            pathesArray.forEach((path, id) => {
                const prev = pathesArray[id - 1];
                if (id === 0) {
                    pathRef.current.setAttribute('d', path);
                } else {
                    tl.to(pathRef.current, loopDuration || 3, { attr: { d: path }, ease: Power1.easeInOut});
                }
            });
            tl.play();
        });
    }

    render() {
        const { value, color, pathes } = this.props;
        const style = {
            transform: `scaleY(${0 + value / 100})`,
            transformOrigin: 'bottom',
        };

        return (
            <View className="percent-chart">
                <svg width="372" height="200" viewBox="0 0 372 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {
                        pathes.map((path, i) => {
                           return <path key={i} opacity="0.5" d="" fill={color || '#FFAFD5'} ref={this._pathes[i]} style={style} />
                        })
                    }
                </svg>

                <View className="tooltip label-btn4" style={{ color }}>{value.toFixed(0)}%</View>
            </View>
        );
    }
}
