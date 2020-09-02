import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Tooltip } from 'app/common/components';
import { ChartDataReadonly } from 'common/viewModels/charts';
import { getPathCoords, getAreaCords, getDotsCoords } from 'common/view/GradientChart';
// import Moods from 'common/models/Moods';
import logger from 'common/logger';

type ChartProps = {
    data: ChartDataReadonly;
    lineCoordsColor?: string;
    startFrom?: number;
    finshAt?: number;
    className?: string;
};

const gradientBg = 'rgba(102, 92, 158, .2)';

@observer
export default class GradientChartComponent extends React.Component<ChartProps> {

    componentDidMount() {
        window.addEventListener('resize', this.onResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize',  this.onResize);
    }

    onResize = () => {
        this.forceUpdate();
    }

    render () {
        const { data, lineCoordsColor, startFrom, finshAt, className } = this.props;

        if (!data || !data.length) {
            return null;
        }

        const offset = 160;
        const designHeight = 64;
        const designWidth = 1440;
        const maxContainer = designWidth - (offset * 2);
        const widthBetwinDots = maxContainer / (data.length - 1) ;

        const zeroPoint = {
            x: 0,
            // y: startFrom != null ? startFrom : data[0].value,
            y: startFrom != null ? startFrom : 0.5,
        };

        const lastPoint = {
            x: designWidth,
            // y: finshAt != null ? finshAt : data[data.length - 1].value,
            y: finshAt != null ? finshAt : 0.5,
        };
        const points = [
            zeroPoint,
           ...( data.length === 1 ?
            [{
                x: designWidth / 2,
                y: data[0].value,
            }]
            :
            data.map((p, i) => ({
                x: offset + i * widthBetwinDots,
                y: p.value,
            }))),
            lastPoint,
        ];

        const lineCoords = getPathCoords(points, designHeight, designWidth);
        const areaCoords = getAreaCords(points, designHeight, designWidth);
        const dots = getDotsCoords(points, designHeight, designWidth);

        const labels = data.map((item, i) => {
            return (
                <View
                    key={i}
                    style={{
                        left: `${(dots[i + 1].x * (window.innerWidth / designWidth))}px`,
                        top:  `${(dots[i + 1].y) / 100}rem`,
                    }}
                    className="text-item"
                >
                    <Tooltip
                        title={item.title}
                        message={item.date}
                        direction="top"
                    />
                </View>
            );
        });

        return (
            <View className={`gradient-chart ${className}`} style={{ background: gradientBg }}>
                <View className="content">
                    {labels}
                </View>
                <svg width="100%" viewBox="0 0 1440 114" transform="translate(0, 0)">
                    <defs>
                        <linearGradient id="bg">
                            {points.map((point, i) => {
                                if (i === 0 || i === points.length - 1) {
                                    return null;
                                }
                                return (
                                    <stop key={i} offset={`${(100 * point.x) / designWidth}%`} stopColor={data[i - 1].color} />
                                );
                            })}
                        </linearGradient>
                    </defs>

                    <g transform="translate(0, 1)">
                        <path className="bg-path" d={areaCoords} stroke="none" fill="url(#bg)" />
                        <path d={lineCoords} stroke={lineCoordsColor ? lineCoordsColor : 'white'} fill="transparent" strokeWidth="2" />

                        {data.map((point, i) => {
                            const coords = dots[i + 1];

                            return (
                                <g key={i} transform={`translate(${coords.x}, ${coords.y})`}>
                                    <path d={`M0 ${designHeight - coords.y}L0 0`} stroke="#fff" strokeDasharray="5 5"/>
                                    <circle r="4" stroke="white" fill={point.color} strokeWidth="2" className="mood-point" />
                                </g>
                            );
                        })}
                    </g>

                </svg>
            </View>
        );
    }
}
