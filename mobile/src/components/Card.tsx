import React from 'react';
import { TouchableHighlight, View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import BaseStyles, { TextStyles } from '../styles/BaseStyles';
import { Theme } from 'src/constants/theme/PStheme';

type CardProps = {
    title: string;
    description: string;
    Image?: React.ComponentClass<SvgProps, any>;
    ImageElement?: JSX.Element;
    children?: any,
    onPress?: () => void;
    numberOfLines?: number,
    style?: StyleProp<ViewStyle>,
    titleStyle?: StyleProp<TextStyle>,
    isTransparent?: boolean,
    theme: Theme,
};

export default function Card(props: CardProps) {
    const { title, description, onPress, Image, ImageElement, children, numberOfLines, style, titleStyle, isTransparent, theme } = props;
    const textColor = isTransparent ? theme.colors.highlight : theme.colors.background;

    return (
        <TouchableHighlight style={[{ ...BaseStyles.card, borderColor: theme.colors.highlight }, style]}
            onPress={onPress} activeOpacity={1}
            underlayColor={theme.colors.highlightSecondary}>
            <View style={[BaseStyles.cardContainer, { backgroundColor: isTransparent ? 'transparent' : theme.colors.highlight }]}>
                {Image && <Image width={20} height={20} stroke={textColor} />}
                {ImageElement}
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[{ ...BaseStyles.cardTitle, color: textColor, marginBottom: 2 }, titleStyle]}>{title}</Text>
                    <Text style={{ ...TextStyles.p3, lineHeight: 16, color: theme.colors.midground }} lineBreakMode='tail' numberOfLines={numberOfLines || 1}>{description}</Text>
                </View>
                {children}
            </View>
        </TouchableHighlight>
    );
}