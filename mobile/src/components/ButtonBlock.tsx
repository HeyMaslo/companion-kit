import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Container from 'src/components/Container';
import Button from 'src/components/Button';
import ActivityButton from 'src/components/ActivityButton';
import { Props as ActivityButtonProps } from 'src/components/ActivityButton';
import BaseStyles from 'src/styles/BaseStyles';
import { Theme } from 'src/constants/theme/PStheme';

type Props = {
    onOk: () => void,
    onCancel: () => void,
    nextDisabled?: boolean,
    containerStyles?: StyleProp<ViewStyle>,
    okTitle?: string,
    cancelTitle?: string,
    loading?: ActivityButtonProps['loading'],
    theme: Theme,
};

export default function ButtonBlock(props: Props) {
    const { containerStyles, onOk, onCancel, okTitle, cancelTitle, nextDisabled, loading, theme } = props;

    return (
        <Container style={[BaseStyles.buttonsBlock, containerStyles]}>
            <Button
                title={cancelTitle || 'BACK'}
                onPress={onCancel}
                style={BaseStyles.blockButtonsWidth}
                isTransparent
                withBorder
                theme={theme}
            />
            <ActivityButton
                disabled={nextDisabled}
                title={okTitle || 'NEXT'}
                style={BaseStyles.blockButtonsWidth}
                onPress={onOk}
                loading={loading || 'promise'}
                withBorder
                theme={theme}
            />
        </Container>
    );
}