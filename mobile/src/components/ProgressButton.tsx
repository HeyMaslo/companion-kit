import React from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import Button, { ButtonProps } from './Button';
import Colors from 'src/constants/colors';
import TextStyles from '../styles/TextStyles';

type Props = ButtonProps & {
    progress: number;
    progressText?: string;
};

interface ProgressButtonState {
    progressAnimation: Animated.Value;
    isLoading: boolean;
}

export default class ProgressButton extends React.Component<
    Props,
    ProgressButtonState
> {
    private _mounted = false;

    state: ProgressButtonState = {
        progressAnimation: new Animated.Value(0.3),
        isLoading: false,
    };

    _onPressHandler = async () => {
        this.setState({ isLoading: true });

        try {
            if (this.props.onPress) {
                await this.props.onPress();
            }
        } finally {
            if (this._mounted) {
                this.setState({ isLoading: false });
            }
        }
    };

    componentDidMount = () => {
        this._animateProgress(this.props.progress);
        this._mounted = true;
    };

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.progress !== this.props.progress) {
            this._animateProgress(this.props.progress);
        }
    }

    private _animateProgress(toValue: number) {
        Animated.timing(this.state.progressAnimation, {
            toValue: toValue,
            duration: 300,
        }).start();
    }

    render() {
        const { progressText } = this.props;
        const { progressAnimation, isLoading } = this.state;

        const width = progressAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
        });

        return (
            <Button
                {...this.props}
                onPress={this._onPressHandler}
                title={isLoading ? null : this.props.title}
                disabled={isLoading}>
                {isLoading && (
                    <View style={styles.loadWrap}>
                        <Animated.View
                            style={[styles.progressIndicator, { width: width }]}
                        />
                        <Text
                            style={[TextStyles.btnTitle, styles.progressText]}>
                            {progressText || 'Please wait...'}
                        </Text>
                    </View>
                )}
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    progressIndicator: {
        height: '100%',
        backgroundColor: Colors.progressButtonIndicatorBg,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    progressText: {
        width: '100%',
        textAlign: 'center',
        position: 'absolute',
        color: Colors.progressButtonText,
    },
    loadWrap: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.progressButtonloadWrapBg,
        borderRadius: 5,
    },
});
