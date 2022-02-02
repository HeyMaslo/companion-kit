import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TextStyles from 'src/styles/TextStyles';
import { Container, ActivityButton, MasloPage } from 'src/components';
import BaseStyles from 'src/styles/BaseStyles';
import Colors from 'src/constants/colors';
import Layout from 'src/constants/Layout';
import { Theme } from 'src/constants/theme/PStheme';

export type ModalButton = {
    text: string;
    color?: string;
    action: () => Promise<any> | void;
};

type ModalButtonOrCustom = ModalButton | { customRender: () => JSX.Element};

export type ModalProps = {
    title: string;
    message?: string | JSX.Element;
    primaryButton: ModalButton;
    secondaryButton?: ModalButtonOrCustom;
    contentHeight?: number;
    onClose?: () => void;
    theme: Theme;
};

export function isModalButton(b: ModalButtonOrCustom): b is ModalButton {
    return !!b && !((b as { customRender: () => JSX.Element})?.customRender);
}

function renderSecondary(secondaryButton: ModalButtonOrCustom, theme: Theme) {
    if (!secondaryButton) {
        return null;
    }

    if (!isModalButton(secondaryButton)) {
        return (
            <View style={styles.additionalBlock}>
                {secondaryButton.customRender()}
            </View>
        );
    }

    return (
        <ActivityButton
            onPress={secondaryButton.action}
            title={secondaryButton.text}
            loading='promise'
            style={BaseStyles.blockButtonsWidth}
            withBorder
            isTransparent
            theme={theme}
        />
    );
}

function ModalView(props: ModalProps) {
    const { title, primaryButton, secondaryButton, message, contentHeight, onClose, theme } = props;
    const heightStyle = { height: contentHeight ? contentHeight : BaseStyles.top43FixedHeight };

    return (
        <MasloPage style={[{ justifyContent: 'flex-end' }, !contentHeight ? BaseStyles.top43 : null]} onClose={onClose} theme={theme}>
            <Container style={[BaseStyles.container, BaseStyles.flexBetween, heightStyle]}>
                <View style={[BaseStyles.textBlock, styles.textBlock]}>
                    <Text style={[TextStyles.h1, styles.title]}>{title}</Text>
                    {message && (typeof(message) === 'string' ? <Text style={[Layout.isSmallDevice ? TextStyles.p2 : TextStyles.p1, styles.desc]}>{message}</Text> : message)}
                </View>
                <View style={[styles.buttonsBlock, { flexWrap: isModalButton(secondaryButton) ? 'wrap' : 'wrap-reverse'}]}>
                    {renderSecondary(secondaryButton, theme)}
                    <ActivityButton
                        onPress={primaryButton.action}
                        title={primaryButton.text}
                        loading='promise'
                        style={[
                            BaseStyles.blockButtonsWidth,
                            !isModalButton(secondaryButton) ? styles.primaryButton : null,
                        ]}
                        theme={theme}
                    />
                </View>
            </Container>
        </MasloPage>
    );
}

namespace ModalView {
    export const MinContentHeight = 354;
}

export default ModalView;

const styles = StyleSheet.create({
    textBlock: {
        marginBottom: 52,
    },
    title: {
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        marginTop: 80,
    },
    desc: {
        textAlign: 'center',
        marginTop: 12,
        width: '100%',
        color: Colors.secondarySubtitle,
    },
    buttonsBlock: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    primaryButton: {
        width: '100%',
    },
    additionalBlock: {
        width: '100%',
        marginBottom: 16,
        alignItems: 'center',
    },
});
