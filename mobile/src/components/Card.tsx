import React from 'react';
import { TouchableHighlight, View, Text, StyleProp, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import BaseStyles, { TextStyles } from '../styles/BaseStyles';
import { Theme } from 'src/constants/theme/PStheme';

type CardProps = {
    title: string;
    description: string;
    Image?: React.ComponentClass<SvgProps, any>;
    children?: any,
    onPress?: () => void;
    numberOfLines?: number,
    style?: StyleProp<ViewStyle>,
    isTransparent?: boolean,
    theme: Theme,
};

export default function Card(props: CardProps) {
    const { title, description, onPress, Image, children, numberOfLines, style, isTransparent, theme } = props;
    const textColor = isTransparent ? theme.colors.highlight : theme.colors.background;

    return (
        <TouchableHighlight style={[{ ...BaseStyles.card, borderColor: theme.colors.highlight }, style]}
            onPress={onPress} activeOpacity={1}
            underlayColor={theme.colors.highlightSecondary}>
            <View style={[BaseStyles.cardContainer, { backgroundColor: isTransparent ? 'transparent' : theme.colors.highlight }]}>
                {Image ? <Image width={20} height={20} style={BaseStyles.cardImage} stroke={textColor} /> : null}
                <View style={BaseStyles.cardTextBlock}>
                    <Text style={{ ...BaseStyles.cardTitle, color: textColor }}>{title}</Text>
                    <Text style={{ ...TextStyles.p3, lineHeight: 16, color: textColor }} lineBreakMode='tail' numberOfLines={numberOfLines || 1}>{description}</Text>
                </View>
                {children}
            </View>
        </TouchableHighlight>
    );
}