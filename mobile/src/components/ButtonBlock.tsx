import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Container from 'src/components/Container';
import Button from 'src/components/Button';
import ActivityButton from 'src/components/ActivityButton';
import { Props as ActivityButtonProps } from 'src/components/ActivityButton';
import BaseStyles from 'src/styles/BaseStyles';

type Props = {
    onOk: () => void;
    onCancel: () => void;
    nextDisabled?: boolean;
    containerStyles?: StyleProp<ViewStyle>;
    okTitle?: string;
    cancelTitle?: string;
    loading?: ActivityButtonProps['loading'];
};

export default function ButtonBlock(props: Props) {
    const {
        containerStyles,
        onOk,
        onCancel,
        okTitle,
        cancelTitle,
        nextDisabled,
        loading,
    } = props;

    return (
        <Container style={[BaseStyles.buttonsBlock, containerStyles]}>
            <Button
                title={cancelTitle || 'BACK'}
                onPress={onCancel}
                style={BaseStyles.blockButtonsWidth}
                isTransparent
                withBorder
            />
            <ActivityButton
                disabled={nextDisabled}
                title={okTitle || 'NEXT'}
                style={BaseStyles.blockButtonsWidth}
                onPress={onOk}
                loading={loading || 'promise'}
                withBorder
            />
        </Container>
    );
}
