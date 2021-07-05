import React from 'react';
import { StyleSheet, View, Text, TouchableHighlight } from 'react-native';
import { TextStyles } from '../styles/BaseStyles';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';
import Layout from 'src/constants/Layout';

interface RadioButtonProps {
    onClick: (index: number) => void;
    label: string;
    checked: boolean;
    index: number;
}

export default function RadioButton(props: RadioButtonProps) {
    const { label, checked, index, onClick } = props;

    const _onClick = React.useCallback(() => {
        onClick(index);
    }, [index]);

    return (
        <TouchableHighlight
            style={styles.radioButton}
            onPress={_onClick}
            underlayColor={'transparent'}>
            <>
                <Text style={[TextStyles.p3, styles.label]}>{label}</Text>
                <View
                    style={[styles.iconWrap, checked ? styles.checked : null]}>
                    {checked && <Images.radioChecked width={8} height={6} />}
                </View>
            </>
        </TouchableHighlight>
    );
}

const styles = StyleSheet.create({
    radioButton: {
        maxWidth: Layout.getViewWidth(82),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginHorizontal: 'auto',
    },
    iconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.borderColor,
        marginLeft: 20,
        width: 20,
        height: 20,
        borderRadius: 10,
        flexShrink: 0,
    },
    checked: {
        backgroundColor: Colors.radioButton.checkedBg,
        borderWidth: 0,
    },
    label: {
        maxWidth: Layout.getViewWidth(72),
        flexShrink: 1,
    },
});
