import React from 'react';
import { BoxShadow } from 'react-native-shadow';
import { StyleSheet, Animated } from 'react-native';

interface IShadowViewProps {
    style?: any;
    children?: any;
    shadowSettings: {
        color: string,
        border: number,
        radius: number,
        opacity: number,
        x: number,
        y: number,
    }
}

interface IShadowViewState {
    shadowParentSizes: { width: number, height: number };
    fadeAnim: any;
}

export default class ShadowView extends React.Component<IShadowViewProps, IShadowViewState> {
    constructor(props) {
        super(props);
        this.state = {
            shadowParentSizes: {
                width: 0,
                height: 0,
            },
            fadeAnim: new Animated.Value(0),
        };
    }

    // Get shadowView parent sizes
    // Invoked on mount and layout changes with
    private _onLayout = (e) => {
        const { width, height } = e.nativeEvent.layout;
        this.setState({
            shadowParentSizes: { width, height },
        });

        this._showCard();
    }

    private _showCard() {
        const { fadeAnim } = this.state;

        Animated.timing(
            fadeAnim,
            {
                toValue: 1,
                duration: 600,
                useNativeDriver: true
            },
        ).start();
    }

    render() {
        const { style, children, shadowSettings } = this.props;
        const { shadowParentSizes, fadeAnim } = this.state;

        const shadowSizes = {
            width: shadowParentSizes.width,
            height: shadowParentSizes.height,
        };

        const shadowOptions = Object.assign(shadowSizes, shadowSettings);

        return (
            <Animated.View
                style={[styles.container, style, { opacity: fadeAnim }]}
                onLayout={this._onLayout}
            >
                <BoxShadow setting={shadowOptions}>
                    {children}
                </BoxShadow>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
        position: 'relative',
    },
});
