import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';

export type PageProps = React.PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
}>;

let styles;

export default class Page<T> extends React.Component<PageProps & T> {
    getContent() {
        return this.props.children;
    }

    render() {
        const { style } = this.props;

        return (
            <View style={[styles.container, style]}>{this.getContent()}</View>
        );
    }
}

styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
});
