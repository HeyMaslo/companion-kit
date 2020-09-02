import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Container } from 'app/common/components';
import { ChartDataReadonly } from 'common/viewModels/charts';

type ChartProps = {
    model: ChartDataReadonly;
};

// observable
export default observer(function GradientChartComponent(props: ChartProps) {
    const { model } = props;

    if (!model || !model.length) {
        return null;
    }

    let gradientColors = '';
    const pointsCount = model.length;
    const markupItems: JSX.Element[] = [];
    const separator = ', ';

    model.forEach((point, i) => {
        const gradientPosition = pointsCount > 1
            ? i * 100 / (pointsCount - 1)
            : 0;

        // add color to gradient string
        gradientColors += `${point.color} ${gradientPosition}%${i === model.length - 1 ? '' : separator}`;

        // add vertical line and title to chart's point
        const itemPosition = i * 100 / (pointsCount - 1);
        const itemStyles = { left: `${itemPosition}%`, transform: 'translateX(-50%)' };
        let itemClassName = 'chart-element';

        if (point.extra) {
            itemClassName += ' extra';
        }

        markupItems.push(
            <View key={point.id || i} className={itemClassName} style={itemStyles}>
                <Text className="label-2">{point.title}</Text>
                <View className="dot" style={{ backgroundColor: point.color }} />
                <View className="line" />
                <Text className="label-2">{point.date}</Text>
            </View>,
        );
    });

    const contentGradient = `linear-gradient(90deg, ${gradientColors})`;

    const fromColor = model[0].color;
    const toColor = model[model.length - 1].color;
    const bgGradient = `linear-gradient(90deg, ${fromColor} 0%, ${fromColor} 50%, ${toColor} 50%, ${toColor} 100%)`;

    return (
        <View key={bgGradient} className="stick-chart" style={{ background: bgGradient }}>
            <Container>
                <View key={contentGradient} className="content" style={{ background: contentGradient }}>
                    {markupItems}
                </View>
            </Container>
        </View>
    );
});