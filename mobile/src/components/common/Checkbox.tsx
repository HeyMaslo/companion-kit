import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from 'src/constants/colors';
import CheckMark from 'src/assets/images/checkmark-white.svg';

type Props = {
    checked: boolean;
    onChange: () => void;
};

export default function Checkbox(props: Props) {
    const { checked, onChange } = props;
    return (
        <TouchableOpacity
            style={[styles.wrap, checked && styles.checked]}
            activeOpacity={1}
            onPress={onChange}>
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
    checked: {
        backgroundColor: Colors.checkboxChecked,
        borderWidth: 0,
    },
});
