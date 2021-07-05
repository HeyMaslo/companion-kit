import React from 'react';
import { TouchableHighlight, StyleSheet, View } from 'react-native';

import Images from 'src/constants/images';

interface AddStoryButtonProps {
    style?: any;
    onPress?: () => void;
    disabled?: boolean;
    width: number;
    height: number;
}

export default class AddStoryButton extends React.Component<
    AddStoryButtonProps
> {
    private _onPressHandler = () => {
        const { onPress } = this.props;

        if (onPress) {
            onPress();
        }
    };

    render() {
        const { disabled, style, width, height } = this.props;

        return (
            <TouchableHighlight
                style={[styles.button, style]}
                onPress={this._onPressHandler}
                underlayColor="transparent"
                activeOpacity={1}
                disabled={disabled}>
                <View
                    style={[styles.bgImage, { width: width, height: height }]}>
                    <Images.bottomAddNewStory width={55} height={55} />
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        flex: -1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bgImage: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
});
