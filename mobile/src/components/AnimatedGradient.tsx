import React from 'react';
import { StyleSheet, Animated } from 'react-native';
import GradientView from './GradientView';

const GradientViewWrapper = Animated.createAnimatedComponent(GradientView);

interface IAnimatedGradientProps {
    duration?: number;
    style?: any;
    children?: any;
    colors: Array<string>;
}

interface IAnimatedGradientState {
    prevColors: Array<string>;
    colors: Array<string>;
    tweener: Animated.Value;
}

export default class AnimatedGradient extends React.Component<
    IAnimatedGradientProps,
    IAnimatedGradientState
> {
    constructor(props) {
        super(props);

        const { colors } = props;

        this.state = {
            prevColors: colors,
            colors,
            tweener: new Animated.Value(0),
        };
    }

    static getDerivedStateFromProps(props, state) {
        const { colors: prevColors } = state;
        const { colors } = props;
        const tweener = new Animated.Value(0);

        return {
            prevColors,
            colors,
            tweener,
        };
    }

    componentDidUpdate() {
        const { duration } = this.props;
        const { tweener } = this.state;

        Animated.timing(tweener, {
            duration: duration,
            toValue: 1,
        }).start();
    }

    render() {
        const { tweener, prevColors, colors } = this.state;

        const { style, children } = this.props;

        const color1Interp = tweener.interpolate({
            inputRange: [0, 1],
            outputRange: [prevColors[0], colors[0]],
        });

        const color2Interp = tweener.interpolate({
            inputRange: [0, 1],
            outputRange: [prevColors[1], colors[1]],
        });

        return (
            <GradientViewWrapper
                style={[style, styles.container]}
                color1={color1Interp}
                color2={color2Interp}>
                {children}
            </GradientViewWrapper>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
});
