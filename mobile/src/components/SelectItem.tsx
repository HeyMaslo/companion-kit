import React from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import Colors from 'src/constants/colors';
import TextStyles from 'src/styles/TextStyles';
import Layout from 'src/constants/Layout';

type Props = {
    title: string;
    onPress: () => void;
    isActive: boolean;
};

export default function SelectItem(props: Props) {
    const { title, onPress, isActive } = props;

    const onSelectClick = () => {
        onPress();
    };

    return (
        <TouchableHighlight
            style={[
                styles.selectItem,
                isActive
                    ? {
                          borderColor: Colors.selectItem.activeBorder,
                          backgroundColor: Colors.selectItem.activeBg,
                      }
                    : null,
            ]}
            onPress={onSelectClick}
            underlayColor={'transparent'}>
            <Text
                style={[
                    TextStyles.p2,
                    isActive ? { color: Colors.selectItem.activeText } : null,
                ]}>
                {title}
            </Text>
        </TouchableHighlight>
    );
}

const styles = StyleSheet.create({
    selectItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: Layout.getViewWidth(42.4),
        height: 56,
        backgroundColor: Colors.selectItem.bg,
        borderColor: 'transparent',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: Layout.getViewWidth(3.8),
    },
});
