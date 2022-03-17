import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const containerStyles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
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

        return (
            <View style={[containerStyles.container, style]}>
                {children}
            </View>
        );
    }
}

export const AnimatedContainer = Animated.createAnimatedComponent(Container);
