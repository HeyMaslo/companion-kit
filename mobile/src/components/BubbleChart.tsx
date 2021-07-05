import React from 'react';
import BubbleChartHelper from 'common/view/BubbleChart';
import { View, LayoutChangeEvent } from 'react-native';
import { observer } from 'mobx-react';
import Colors from 'src/constants/colors';
import { WordReference } from 'common/models';
import { Svg, G, Circle, Text as SvgText, TSpan } from 'react-native-svg';

type Props = {
    data: ReadonlyArray<WordReference>;
    height: number;
    theme: Themes;
};

type State = {
    width: number;
    height: number;
};

export enum Themes {
    dark,
    light,
}

@observer
export default class BubbleCHart extends React.Component<Props, State> {
    private _chart = new BubbleChartHelper(30, 62);
    private _layoutReady: boolean = false;

    static truncateWords(n: number, word: string) {
        return word.length > n ? word.substr(0, n - 1) + '...' : word;
    }

    static tryToBreakLine(words: string) {
        const maxLength = 11;
        return words.split(' ').map((s, i) => (
            <TSpan key={i} x="0" dy={`${i === 0 ? 0 : 1.2}em`}>
                {BubbleCHart.truncateWords(maxLength, s)}
            </TSpan>
        ));
    }

    componentWillUnmount() {
        this._chart.endSimulation();
    }

    componentDidUpdate(prevProps: Props) {
        if (
            this.props.data !== prevProps.data ||
            this.props.data.length !== prevProps.data.length
        ) {
            this.activateChart();
        }
    }

    activateChart = () => {
        if (!this._layoutReady) {
            return;
        }

        const { height, width } = this.state;
        this._chart.onResize(height, width);
        this._chart.restartSimulation(this.props.data);
    };

    onLayout = (e: LayoutChangeEvent) => {
        if (this._layoutReady) {
            // for some reason onLayout fires twice
            return;
        }

        const { height, width } = e.nativeEvent.layout;

        this.setState({ height, width }, () => {
            this._layoutReady = true;
            this.activateChart();
        });
    };

    renderBubbles = () => {
        const { rendersCount, nodeData } = this._chart;
        const { theme } = this.props;
        const skipRenders = 10;

        if (rendersCount <= skipRenders) {
            return null;
        }

        // render circle and text elements inside a group
        const bubbles = nodeData.map((item, index) => {
            let fontSize = item.r * 0.3;

            if (item.value.length > 8) {
                fontSize *= 0.8;
            }

            let stroke: string;
            let fill: string;
            let mainTextColor: string;

            switch (theme) {
                case Themes.dark:
                    mainTextColor =
                        item.r > 50
                            ? Colors.bubbleChartDarkTheme.mainTextColor.large
                            : Colors.bubbleChartDarkTheme.mainTextColor.small;
                    fill =
                        item.r > 50
                            ? Colors.bubbleChartDarkTheme.fill.large
                            : Colors.bubbleChartDarkTheme.fill.small;
                    break;
                case Themes.light:
                    mainTextColor =
                        item.r > 50
                            ? Colors.bubbleChartLightTheme.mainTextColor.large
                            : Colors.bubbleChartLightTheme.mainTextColor.small;
                    stroke =
                        item.r > 50
                            ? Colors.bubbleChartLightTheme.stroke.large
                            : Colors.bubbleChartLightTheme.stroke.small;
                    fill = Colors.bubbleChartLightTheme.fill.small;
                    break;
                default:
            }

            const value = BubbleCHart.tryToBreakLine(item.value);
            const translateValue =
                value.length > 1 ? -(value.length / 2) * fontSize * 0.85 : 0;

            return (
                <G key={index} translateX={item.x} translateY={item.y}>
                    <Circle
                        r={item.r}
                        strokeWidth="1"
                        stroke={stroke}
                        fill={fill}
                    />
                    <SvgText
                        y={4}
                        translateY={translateValue}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fontWeight="normal"
                        fontFamily="HelveticaNeue-Medium"
                        fill={mainTextColor}>
                        {item.r > 20 && value}
                    </SvgText>
                    <SvgText
                        y={4}
                        translateY={(value.length / 2) * fontSize + 5}
                        fill={Colors.bubbleChartSVGText}
                        textAnchor="middle"
                        fontSize={fontSize * 0.6}
                        fontWeight="normal"
                        fontFamily="HelveticaNeue-Medium">
                        {item.r > 50 && item.count + ' TIMES'}
                    </SvgText>
                </G>
            );
        });

        return bubbles;
    };

    render() {
        return (
            <View
                style={{ width: '100%', height: this.props.height }}
                onLayout={this.onLayout}>
                <Svg style={{ width: '100%', height: '100%' }}>
                    {this.renderBubbles()}
                </Svg>
            </View>
        );
    }
}
