import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import Colors from 'src/constants/colors';
import { notch } from 'src/styles/BaseStyles';
import Layout from 'src/constants/Layout';

type Props = {
    height?: number;
};

export function PersonaScrollMask(props: Props) {
    const styles = React.useMemo(() => {
        if (!props.height) {
            return baseStyles.gradientMask;
        }

        return {
            ...baseStyles.gradientMask,
            height: props.height,
        };
    }, [props.height]);

    return (
        <LinearGradient
            colors={[Colors.gradientMaskColor1, Colors.gradientMaskColor2]}
            style={styles}
            locations={[0.54, 1.0]}
        />
    );
}

const baseStyles = StyleSheet.create({
    gradientMask: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        elevation: 1,
        width: Layout.window.width,
        height: notch ? Layout.getViewHeight(22) : Layout.getViewHeight(28),
    },
});
