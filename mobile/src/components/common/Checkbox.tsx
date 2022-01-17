import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from 'src/constants/colors';
import CheckMark from 'src/assets/images/checkmark-white.svg';
import { Theme } from 'src/constants/theme/PStheme';

type Props = {
    checked: boolean;
    onChange: () => void;
    theme: Theme;
};

export default function Checkbox(props: Props) {
    const { checked, onChange, theme } = props;
    return (
        <TouchableOpacity style={[styles.wrap, checked && { borderWidth: 0, backgroundColor: theme.colors.highlight }]} activeOpacity={1} onPress={onChange}>
            {checked && <CheckMark />}
        </TouchableOpacity>
    );
}

const size = 22;

const styles = StyleSheet.create({
    wrap: {
        height: size,
        width: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
});