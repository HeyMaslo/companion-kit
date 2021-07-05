import React from 'react';
import { Svg, Defs, LinearGradient, Stop, G, Circle } from 'react-native-svg';
import {
    StyleProp,
    ViewStyle,
    View,
    Animated,
    Text,
    TextStyle,
} from 'react-native';
import { clamp } from 'common/utils/mathx';
import Colors from 'src/constants/colors';
import TextStyles from 'src/styles/TextStyles';

const AnimatedContainer = Animated.createAnimatedComponent(Circle);

type Props = {
    style?: StyleProp<ViewStyle>;
    progress: number;
    diameter: number;
};

const getOffset = (d: number, progress: number) =>
    Math.round(d * Math.PI * clamp(1 - progress, 0, 1));

export function ProgressBarCircle(this: never, props: Props) {
    const { style, diameter, progress } = props;
    const length = Math.round(diameter * Math.PI);

    const offset = getOffset(diameter, progress);

    return (
        <View style={style}>
            <Svg
                id="progress-bar-circle"
                width="100%"
                height="100%"
                viewBox={`0 0 ${diameter + 2} ${diameter + 2}`}
                fill="none">
                <G x={1} y={1}>
                    <Circle
                        opacity="0.2"
                        cx={diameter / 2}
                        cy={diameter / 2}
                        r={diameter / 2}
                        stroke={Colors.ProgressBarCircle.progressBarCircleLine}
                        strokeWidth="1"
                    />
                    <Circle
                        cx={diameter / 2}
                        cy={diameter / 2}
                        r={diameter / 2}
                        stroke={Colors.ProgressBarCircle.progressBarCircleLine}
                        strokeWidth="1"
                        strokeDasharray={length}
                        strokeDashoffset={offset}
                        origin={`${diameter / 2}, ${diameter / 2}`}
                        rotation={-90}
                    />
                </G>
            </Svg>
        </View>
    );
}

export type GradColor = {
    title: string;
    offset: number;
};

type PropsGradient = Props & {
    title: string;
    animationStep: number;
    gradient?: GradColor[];
    titleStyle?: StyleProp<any>;
    startFromBottom?: boolean;
};

export function ProgressBarCircleGradient(this: never, props: PropsGradient) {
    const {
        animationStep,
        title,
        diameter,
        gradient,
        progress,
        style,
        titleStyle,
        startFromBottom,
    } = props;
    const length = Math.round(diameter * Math.PI);

    const [offset] = React.useState(() => {
        const startProgress = progress - (animationStep || 0.1);
        return new Animated.Value(getOffset(diameter, startProgress));
    });

    React.useEffect(() => {
        Animated.timing(offset, {
            toValue: getOffset(diameter, progress),
            duration: 2000,
            delay: 750,
        }).start();
    }, [progress]);

    const boxSize = diameter + 6;
    const origin = diameter / 2;

    const defaultTitleStyles: StyleProp<TextStyle> = {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <View style={style}>
            <Text style={[TextStyles.p3, defaultTitleStyles, titleStyle]}>
                {title}
            </Text>
            <Svg
                id="progress-bar-circle"
                width="100%"
                height="100%"
                viewBox={`0 0 ${boxSize} ${boxSize}`}
                fill="none">
                <G x={3} y={3}>
                    <Circle
                        id="circle-bg"
                        opacity="0.2"
                        cx={diameter / 2}
                        cy={diameter / 2}
                        r={diameter / 2}
                        strokeWidth="3"
                        stroke="url(#paint0_linear)"
                        fill="none"
                    />
                    <AnimatedContainer
                        id="circle-progress"
                        fill="none"
                        cx={diameter / 2}
                        cy={diameter / 2}
                        r={diameter / 2}
                        strokeWidth="3"
                        stroke="url(#paint0_linear)"
                        strokeDasharray={length}
                        strokeDashoffset={offset}
                        origin={`${origin}, ${origin}`}
                        rotation={startFromBottom ? 90 : -90}
                    />
                </G>
                <Defs>
                    {gradient ? (
                        <LinearGradient
                            id="paint0_linear"
                            x1={diameter / 2}
                            y1={diameter}
                            x2={diameter}
                            y2={0}
                            gradientUnits="userSpaceOnUse">
                            {gradient.map((color, i) => {
                                // tslint:disable-next-line: no-unused-expression
                                return (
                                    <Stop
                                        key={`${color.title}_${i}`}
                                        offset={color.offset}
                                        stopColor={color.title}
                                    />
                                );
                            })}
                        </LinearGradient>
                    ) : (
                        <LinearGradient
                            id="paint0_linear"
                            x1={0}
                            y1={diameter / 2}
                            x2={diameter}
                            y2={diameter / 2}
                            gradientUnits="userSpaceOnUse">
                            <Stop offset="0.0996095" stopColor="#FFCECF" />
                            <Stop offset="0.238673" stopColor="#9A87E7" />
                            <Stop offset="0.384948" stopColor="#FFAFD5" />
                            <Stop offset="0.512681" stopColor="#FA8989" />
                            <Stop offset="0.642474" stopColor="#CFC4FF" />
                            <Stop offset="0.776388" stopColor="#FFAFD5" />
                            <Stop offset="0.90206" stopColor="#FFCED0" />
                        </LinearGradient>
                    )}
                </Defs>
            </Svg>
        </View>
    );
}
