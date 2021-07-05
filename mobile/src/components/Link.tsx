import React from 'react';
import { StyleSheet, Text, StyleProp, TextStyle } from 'react-native';
import Colors from 'src/constants/colors';
import { tryOpenLink } from 'src/constants/links';
import TextStyles from 'src/styles/TextStyles';

type LinkProps = React.PropsWithChildren<{
    style?: StyleProp<TextStyle>;
    link?: string;
}>;

export default function Link(this: void, props: LinkProps) {
    const { link } = props;

    const onPressHandler = React.useCallback(() => {
        if (link) {
            tryOpenLink(link, false);
        }
    }, [link]);

    const { style, children } = props;

    return (
        <Text
            style={[TextStyles.p4, styles.link, style]}
            onPress={onPressHandler}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    link: {
        position: 'relative',
        color: Colors.linkDefault,
        textTransform: 'capitalize',
    },
});
