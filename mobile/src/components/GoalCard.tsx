import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Images from 'src/constants/images';
import { Theme } from 'src/constants/theme/PStheme';
import TextStyles from 'src/styles/TextStyles';

export type GoalCardProps = {
    title: string
    checked: boolean;
    onPress: () => void;
    theme: Theme,
};

export default function GoalCard(props: GoalCardProps) {
    const { title, checked, onPress, theme } = props;

    return (
        <TouchableOpacity style={[styles.goalCard, checked ? styles.cardChecked : null]} activeOpacity={0.7} onPress={onPress}>
            <Text style={[TextStyles.p2, styles.title]}>{title}</Text>
            <View style={[styles.checkbox, checked && { backgroundColor: theme.colors.highlight }]}>
                {checked && <Images.radioChecked width={8} height={6} />}
            </View>
        </TouchableOpacity>
    );
}

const size = 24;
const goalCardStyles = {
    bg: '#4C40CF',
    checkedBg: '#191B5E',
};

const styles = StyleSheet.create({
    goalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 5,
        backgroundColor: goalCardStyles.bg,
        marginBottom: 16,
    },
    title: {
        flexShrink: 1,
        marginRight: 24,
    },
    checkbox: {
        height: size,
        width: size,
        borderRadius: 5,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        flexShrink: 0,
    },
    checkboxChecked: {
        borderWidth: 0,
    },
});