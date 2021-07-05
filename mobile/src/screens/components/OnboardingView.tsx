import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingSettings } from 'src/services/Onboading';

import TextStyles from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';

import {
    MasloPage,
    Container,
    ProgressBarCircleGradient,
    Button,
} from 'src/components';
import BaseStyles from 'src/styles/BaseStyles';
import { IPersonaViewContext } from 'src/stateMachine/abstractions';

type Props = {
    content: OnboardingSettings;
    stepIndex?: number;
    totalCount?: number;
    personaViewContext?: IPersonaViewContext;
};

const progressBarDiameter = 120;
const minContentHeight = 344;

export default function OnboardingView(props: Props) {
    const { content, stepIndex, totalCount, personaViewContext } = props;

    if (!content) {
        return null;
    }

    const {
        title,
        description,
        primaryButton,
        secondaryButton,
        onClose,
    } = content;

    const singleButton = !primaryButton || !secondaryButton;
    const progress01 = totalCount ? stepIndex / totalCount : null;

    const contentHeight = React.useMemo(
        () =>
            totalCount
                ? personaViewContext.setupContainerHeightForceScroll()
                : personaViewContext.setupContainerHeight(minContentHeight),
        [stepIndex],
    );

    return (
        <MasloPage onClose={onClose} style={BaseStyles.page}>
            <Container
                style={[
                    BaseStyles.container,
                    BaseStyles.flexBetween,
                    { height: contentHeight },
                ]}>
                {!!totalCount && (
                    <ProgressBarCircleGradient
                        title={`step ${stepIndex} of ${totalCount}`}
                        animationStep={1 / totalCount}
                        progress={progress01}
                        diameter={progressBarDiameter}
                        style={styles.progressBar}
                    />
                )}
                <View style={BaseStyles.textBlock}>
                    <Text style={[TextStyles.h1, styles.title]}>{title}</Text>
                    <Text
                        style={[
                            TextStyles.p1,
                            BaseStyles.textCenter,
                            { color: Colors.secondarySubtitle },
                        ]}>
                        {description}
                    </Text>
                </View>
                <View style={BaseStyles.buttonsBlock}>
                    {secondaryButton !== null && (
                        <Button
                            title={secondaryButton.title}
                            onPress={secondaryButton.action}
                            style={
                                singleButton
                                    ? '100%'
                                    : BaseStyles.blockButtonsWidth
                            }
                            withBorder
                            isTransparent
                        />
                    )}
                    {primaryButton !== null && (
                        <Button
                            title={primaryButton.title}
                            onPress={primaryButton.action}
                            style={
                                singleButton
                                    ? '100%'
                                    : BaseStyles.blockButtonsWidth
                            }
                        />
                    )}
                </View>
            </Container>
        </MasloPage>
    );
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 12,
    },
    progressBar: {
        width: progressBarDiameter,
        height: progressBarDiameter,
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
