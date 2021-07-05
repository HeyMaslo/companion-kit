import React from 'react';
import { Text } from 'react-native';
import { TextStyles } from 'src/styles/BaseStyles';
import Colors from 'src/constants/colors';

type Props = {
    text: string;
    buttonText: string;
    onPress: () => any;
    theme?: 'dark' | 'light';
};

export default function ButtonContext(props: Props) {
    const { text, buttonText, onPress, theme } = props;
    const lightTheme = theme === 'light';

    return (
        <Text style={TextStyles.p4}>
            {text}
            <Text onPress={onPress} style={{ color: Colors.linkDefault }}>
                &nbsp;{buttonText}
            </Text>
        </Text>
    );
}
