import React from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import TextStyles from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';
import { Container, GradientChart } from 'src/components';
import { ChartDataReadonly } from 'common/viewModels/charts';

type Props = {
    gradientChart: ChartDataReadonly;
};

const styles = StyleSheet.create({
    contentContainer: {
        width: '100%',
    },
    title1: {
        color: Colors.gradientChartBlockTitle1,
    },
    title2: {
        color: Colors.gradientChartBlockTitle2,
    },
    gradientChartContainer: {
        width: '100%',
        marginTop: 31,
        overflow: 'visible',
        position: 'relative',
    },
});

export default class GradientChartBlock extends React.Component<Props> {
    private scrollView: React.RefObject<ScrollView> = React.createRef();

    render() {
        const { gradientChart } = this.props;

        if (!gradientChart || gradientChart.length <= 0) {
            return null;
        }

        return (
            <>
                <Container style={styles.contentContainer}>
                    <Text style={[TextStyles.h3, styles.title1]}>
                        Mood <Text style={styles.title2}>this week</Text>
                    </Text>
                </Container>
                <ScrollView
                    ref={this.scrollView}
                    onContentSizeChange={() => {
                        this.scrollView.current.scrollToEnd({ animated: true });
                    }}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    style={[styles.gradientChartContainer]}
                    contentContainerStyle={{ overflow: 'visible' }}
                    automaticallyAdjustContentInsets={false}>
                    <GradientChart model={gradientChart} />
                </ScrollView>
            </>
        );
    }
}
