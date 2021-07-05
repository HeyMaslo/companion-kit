import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Colors from 'src/constants/colors';
import { View } from 'react-native';

interface DotsProps {
    active: number;
    length: number;
    styles?: ViewStyle;
}

let styles;

export default function Dots(props: DotsProps) {
    const dots: React.ReactElement[] = [];

    for (let i = 0; i < props.length; i++) {
        const active = i === props.active;
        const last = i === props.length - 1;

        dots.push(
            <View
                key={i}
                style={[
                    styles.dot,
                    active && styles.dotActive,
                    last && styles.mr0,
                ]}
            />,
        );
    }

    return (
        <View style={[styles.dots, props.styles ? props.styles : null]}>
            {dots}
        </View>
    );
}

styles = StyleSheet.create({
    dots: {
        position: 'absolute',
        top: 22,
        left: 19,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 5,
        height: 5,
        backgroundColor: Colors.dotBg,
        borderRadius: 2.5,
        marginRight: 5,
    },
    dotActive: {
        backgroundColor: Colors.dotActiveBg,
    },
    mr0: {
        marginRight: 0,
    },
});
