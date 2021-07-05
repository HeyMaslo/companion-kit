import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingLeft: 20,
        paddingRight: 20,
        paddingVertical: 0,
    },
});

type ContainerProps = {
    children: any;
    style?: any;
};

export default class Container extends React.Component<ContainerProps> {
    render() {
        const { children, style } = this.props;

        return <View style={[styles.container, style]}>{children}</View>;
    }
}

export const AnimatedContainer = Animated.createAnimatedComponent(Container);
