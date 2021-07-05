import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, StyleSheet } from 'react-native';
import {
    Svg,
    Defs,
    G,
    Path,
    Circle,
    Stop,
    LinearGradient,
} from 'react-native-svg';
import {
    getPathCoords,
    getAreaCords,
    getDotsCoords,
} from 'common/view/GradientChart';
import { ChartDataReadonly } from 'common/viewModels/charts';
import Layout from 'src/constants/Layout';
import { TextStyles } from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';

interface IGradientChartProps {
    model: ChartDataReadonly;
    style?: any;
}

const textItemWidth = 100;

const styles = StyleSheet.create({
    labelsContainer: {
        position: 'relative',
        height: 50,
        overflow: 'visible',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    textBlock: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: textItemWidth,
        transform: [{ translateX: -textItemWidth / 2 }],
    },
    sentiment: {
        color: Colors.gradientChartSentimentColor,
        marginBottom: 1,
        textAlign: 'center',
    },
    date: {
        color: Colors.gradientChartDateColor,
    },
    svg: {
        backgroundColor: Colors.gradientChartSvgBg,
    },
});

const CHART_ITEMS_GAP = 154;

@observer
export default class GradientChart extends React.Component<
    IGradientChartProps
> {
    get model() {
        return this.props.model;
    }

    render() {
        const data = this.model;

        if (!data || data.length <= 0) {
            return null;
        }

        const zeroPoint = {
            x: 0,
            y: 0.5,
        };

        const lastPoint = {
            x: data.length + 1,
            y: 0.5,
        };

        const points = [
            zeroPoint,
            ...data.map((p, i) => ({ x: i + 1, y: p.value })),
            lastPoint,
        ];
        const designHeight = 80;
        const paddingHor = Layout.window.width - CHART_ITEMS_GAP;
        let designWidth = (data.length - 1) * CHART_ITEMS_GAP + paddingHor;

        if (designWidth < Layout.window.width) {
            designWidth = Layout.window.width;
        }

        const lineCoords = getPathCoords(points, designHeight, designWidth);
        const areaCoords = getAreaCords(points, designHeight, designWidth);
        const dots = getDotsCoords(points, designHeight, designWidth);

        const labels = data
            .filter((item) => item)
            .map((item, i) => {
                return (
                    <View
                        key={i}
                        style={[styles.textBlock, { left: dots[i + 1].x }]}>
                        <Text style={[TextStyles.labelSmall, styles.sentiment]}>
                            {item.title.toUpperCase()}
                        </Text>
                        <Text style={[TextStyles.labelSmall, styles.date]}>
                            {item.date.toUpperCase()}
                        </Text>
                    </View>
                );
            });

        return (
            <View>
                <View style={[styles.labelsContainer]}>{labels}</View>
                <Svg
                    height={designHeight + 20}
                    width={designWidth}
                    viewBox={`0 0 ${designWidth} ${designHeight + 20}`}
                    style={styles.svg}>
                    <Defs>
                        <LinearGradient id="bg">
                            {data.map((point, i) => (
                                <Stop
                                    key={i}
                                    offset={`${
                                        (i + 1) * (100 / (data.length + 1))
                                    }%`}
                                    stopColor={point.color}
                                />
                            ))}
                        </LinearGradient>
                    </Defs>

                    <G translateY="10">
                        <Path d={areaCoords} stroke="none" fill="url(#bg)" />
                        <Path
                            d={lineCoords}
                            stroke="white"
                            fill="transparent"
                            strokeWidth="2"
                        />

                        {data.map((point, i) => {
                            const coords = dots[i + 1];

                            return (
                                <G key={i} translate={[coords.x, coords.y]}>
                                    <Path
                                        d={`M1 ${designHeight - coords.y}L1 0`}
                                        stroke="#fff"
                                        strokeDasharray="5 5"
                                    />
                                    <Circle
                                        r="6"
                                        stroke="white"
                                        fill={point.color}
                                        strokeWidth="2"
                                    />
                                </G>
                            );
                        })}
                    </G>
                </Svg>
            </View>
        );
    }
}
