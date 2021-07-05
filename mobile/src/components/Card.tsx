import React from 'react';
import {
    TouchableHighlight,
    View,
    Text,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { SvgProps } from 'react-native-svg';
import BaseStyles, { TextStyles } from '../styles/BaseStyles';
import Colors from 'src/constants/colors';

type CardProps = {
    title: string;
    description: string;
    Image?: React.ComponentClass<SvgProps, any>;
    children?: any;
    onPress?: () => void;
    numberOfLines?: number;
    style?: StyleProp<ViewStyle>;
    underlayColor?: boolean | string;
};

export default function Card(props: CardProps) {
    const {
        title,
        description,
        onPress,
        Image,
        children,
        numberOfLines,
        style,
        underlayColor,
    } = props;

    return (
        <TouchableHighlight
            style={[BaseStyles.card, style]}
            onPress={onPress}
            activeOpacity={1}
            underlayColor={
                underlayColor
                    ? Colors.card.underlay.primary
                    : Colors.card.underlay.secondary
            }>
            <View style={BaseStyles.cardContainer}>
                {Image ? (
                    <Image
                        width={20}
                        height={20}
                        style={BaseStyles.cardImage}
                    />
                ) : null}
                <View style={BaseStyles.cardTextBlock}>
                    <Text style={BaseStyles.cardTitle}>{title}</Text>
                    <Text
                        style={{
                            ...TextStyles.p3,
                            lineHeight: 16,
                            color: Colors.card.description,
                        }}
                        lineBreakMode="tail"
                        numberOfLines={numberOfLines || 1}>
                        {description}
                    </Text>
                </View>
                {children}
            </View>
        </TouchableHighlight>
    );
}
