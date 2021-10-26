
import React from 'react';
import {
    Svg,
    G,
    Circle,
} from 'react-native-svg';
import { View, Animated, Easing } from 'react-native';
import { clamp } from 'common/utils/mathx';
import type { ProgressData } from 'src/helpers/progressData';

const AnimatedContainer = Animated.createAnimatedComponent(Circle);

const getOffset = (d: number, progress: number) => Math.round(d * Math.PI * clamp(1 - progress, 0, 1));

export type ConcentricCirclesStyles = {
    diameter: number;
    strokeBgColor: string;
};

export type ConcentricCirclesProps = {
    styles: ConcentricCirclesStyles,
    model: {
        grade: number,
        progress: Readonly<ProgressData>[],
    },
};

const GradeColors = [
    ['#FFE487', '#FF6887', '#FF37A5', '#FC68FF', '#B14EFF'],
    ['#FFB987', '#FF7E87', '#FF5387', '#6096FF', '#7660FF'],
    ['#FF9A87', '#FF6887', '#FA7171', '#5E4FFF', '#8C69FF'],
];

export default function ConcentricCircles(this: never, props: ConcentricCirclesProps) {
    const { styles, model } = props;
    const { grade, progress } = model;
    const { diameter, strokeBgColor } = styles;

    const diameterPercentage = v => {
        return (diameter / 100) * v;
    };

    const strokeWidth = Math.round(diameterPercentage(5));
    const strokeColor = GradeColors[grade] || GradeColors[GradeColors.length - 1];
    const boxSize = diameter + strokeWidth * 2;

    return (
        <View style={{ width: diameter, height: diameter }}>
            <Svg width="100%" height="100%" viewBox={`0 0 ${boxSize} ${boxSize}`} fill="none">
                <G x={strokeWidth} y={strokeWidth}>
                    {progress.map((p, i) => {
                        const dec = (progress.length - 1) - i;
                        const radiusDecremented = (diameter - diameterPercentage(21.3) * dec) / 2;

                        const nextProgress = progress[i + 1]?.current;
                        const step = p.progress < 1 || nextProgress === 0 ? (1 / p.max) : null;
                        const sColor = p.progress !== 0 ? strokeColor[i] : strokeBgColor;
                        const sBgColor = p.progress === 1 ? strokeColor[i] : strokeBgColor;

                        return (
                            <ConcentricCircle
                                key={i}
                                strokeColor={sColor}
                                strokeBgColor={sBgColor}
                                strokeWidth={strokeWidth}
                                radiusDecremented={radiusDecremented}
                                radius={diameter / 2}
                                progress={p.progress}
                                animationStep={step}
                            />
                        );
                    })}
                </G>
            </Svg>
        </View>
    );
}

type ConcentricCircleProps = {
    strokeBgColor: string;
    strokeColor: string;
    strokeWidth: number;
    radiusDecremented: number;
    radius: number;
    progress: number;
    animationStep: number;
};

export function ConcentricCircle(props: ConcentricCircleProps) {
    const { strokeBgColor, strokeColor, strokeWidth, radiusDecremented, radius, progress, animationStep } = props;
    const diameter = radiusDecremented * 2;
    const length = Math.round(diameter * Math.PI);

    const offset = React.useMemo(() => {
        if (!animationStep) {
            return null;
        }

        const startProgress = progress - animationStep;
        return new Animated.Value(getOffset(diameter, startProgress));
    }, [animationStep, diameter, progress]);

    React.useEffect(() => {
        if (offset != null) {
            Animated.timing(offset, {
                toValue: getOffset(diameter, progress),
                duration: 1500,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }).start();
        }
    }, [progress]);

    return (
        <>
            <Circle
                cx={radius}
                cy={radius}
                r={radiusDecremented}
                strokeWidth={strokeWidth}
                stroke={strokeBgColor}
                fill="none"
            />
            <AnimatedContainer
                fill="none"
                cx={radius}
                cy={radius}
                r={radiusDecremented}
                strokeWidth={strokeWidth}
                stroke={strokeColor}
                strokeDasharray={length}
                strokeDashoffset={offset}
                origin={`${radius}, ${radius}`}
                rotation={-90}
            />
        </>
    );
}
