import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
} from 'react-native';
import Images from 'src/constants/images';

const styles = StyleSheet.create({
    backBtn: {
        width: 44,
        height: 44,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        left: 0,
        backgroundColor: 'transparent',
        zIndex: 10,
    },
});

type Props = {
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
};

export default function BackButton(props: Props) {
    const onPress = props.onPress;

    return (
        <TouchableOpacity
            style={[styles.backBtn, props.style]}
            onPress={onPress}>
            <Images.backIcon width={28} height={14} />
        </TouchableOpacity>
    );
}
