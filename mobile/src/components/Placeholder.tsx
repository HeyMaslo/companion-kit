import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, Text, View } from 'react-native';
import Images from 'src/constants/images';
import Colors from 'src/constants/colors';
import Layout from 'src/constants/Layout';
import { TextStyles } from 'src/styles/TextStyles';

type Props = {
    message: string;
    style?: StyleProp<ViewStyle>;
};

const ContainerHeight = Layout.isSmallDevice ? 174 : 208;

export default function Placeholder(props: Props) {
    const { message, style } = props;

    return (
        <View style={[styles.placeholder, style]}>
            <Images.emptyIcon width={24} height={24} />
            <Text style={styles.placeholderText}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        width: Layout.window.width - 40,
        height: ContainerHeight,
        borderRadius: 5,
        backgroundColor: Colors.placeholder.bg,
        marginHorizontal: 20,
    },
    placeholderText: {
        ...TextStyles.p3,
        color: Colors.placeholder.text,
        marginTop: 12,
    },
});
