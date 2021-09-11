import React from 'react';
import { StyleSheet, Text, View, Animated, ScrollView } from 'react-native';

import { IntakeFormTypes } from 'common/models';

import TextStyles from 'src/styles/TextStyles';
import Layout from 'src/constants/Layout';
import Colors from 'src/constants/colors';

import { MasloPage, Container, AnimatedContainer, ProgressBarHaflCircle, Button, ActivityButton } from 'src/components';
import BaseStyles from 'src/styles/BaseStyles';
import { GradColor } from 'src/components/ProgressBarCircle';
import { IPersonaViewContext } from 'src/stateMachine/abstractions';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';

export type FormViewProps = {
    text: string;
    answers: IntakeFormTypes.Answer[];
    stepIndex?: number;
    totalCount?: number;
    isFinalScreen: boolean;
    intermission: IntakeFormTypes.IntermissionScreen;
    onClose: () => void;
    nextStep: (answerIndex: number, route?: number) => void;
    previousStep: () => void;
    addResponse: () => Promise<void>;
    personaViewContext?: IPersonaViewContext,
};

const progressBarDiameter = Layout.getViewWidth(63);
const minContentHeight = 344;

const gradColors: GradColor[] = [
    { title: Colors.ProgressBarCircle.gradColor1, offset: 0.0996095 },
    { title: Colors.ProgressBarCircle.gradColor2, offset: 0.238673 },
    { title: Colors.ProgressBarCircle.gradColor3, offset: 0.384948 },
    { title: Colors.ProgressBarCircle.gradColor4, offset: 0.512681 },
    { title: Colors.ProgressBarCircle.gradColor5, offset: 0.642474 },
    { title: Colors.ProgressBarCircle.gradColor5, offset: 0.90206 },
];

function getContainerHeight(ctx: IPersonaViewContext, withoutScroll: boolean = false) {
    return withoutScroll
        ? ctx.setupContainerHeight(minContentHeight)
        : ctx.setupContainerHeightForceScroll();
}

export default function FormView(props: FormViewProps) {
    const {
        text,
        answers,
        stepIndex,
        totalCount,
        onClose,
        nextStep,
        previousStep,
        isFinalScreen,
        addResponse,
        intermission,
        personaViewContext,
    } = props;

    if (!answers) {
        return null;
    }

    const progress01 = totalCount ? (stepIndex / totalCount) : null;

    const [contentHeight, setContentHeight] = React.useState(() => getContainerHeight(personaViewContext));

    React.useEffect(() => {
        const ch = getContainerHeight(personaViewContext, isFinalScreen || !!intermission);
        setContentHeight(ch);
    }, [isFinalScreen, !!intermission]);

    const opacity = React.useMemo(() => {
        return new Animated.Value(0);
    }, []);

    React.useEffect(() => {
        Animated.timing(opacity, {
            toValue: +isFinalScreen,
            duration: 750,
            useNativeDriver: true,
        }).start();
    }, [isFinalScreen]);

    let content: React.ReactNode = null;

    if (isFinalScreen) {
        content = (
            <AnimatedContainer style={[BaseStyles.container, BaseStyles.flexBetween, styles.finalContainer, { opacity: opacity, height: contentHeight }]}>
                <View style={BaseStyles.textBlock}>
                    <Text style={[TextStyles.h1, styles.title]}>You're done!</Text>
                    <Text style={[TextStyles.p1, BaseStyles.textCenter, { color: Colors.secondarySubtitle }]}>Please submit so that your therapist can review your results.</Text>
                </View>
                <ActivityButton
                    title={'Submit'}
                    onPress={addResponse}
                    loading="promise"
                />
            </AnimatedContainer>
        );
    } else if (intermission) {
        content = (
            <Container style={[BaseStyles.container, BaseStyles.flexBetween, styles.finalContainer, { opacity: 1, height: contentHeight }]}>
                <View style={BaseStyles.textBlock}>
                    <Text style={[TextStyles.h1, styles.title]}>{intermission.title}</Text>
                    <Text style={[TextStyles.p1, BaseStyles.textCenter, { color: Colors.secondarySubtitle }]}>{intermission.text}</Text>
                </View>
                <View style={{ width: '100%' }}>
                    <Button
                        title="Continue"
                        onPress={() => nextStep(null)}
                    />
                </View>
            </Container>
        );
    } else {
        content = (
            <ScrollView contentContainerStyle={[styles.formScrollWrapper]}>
                <Container style={[BaseStyles.container, BaseStyles.flexBetween, styles.scrollableContainer]}>
                    <View style={[BaseStyles.textBlock, styles.textBlock]}>
                        <Text style={[
                            {...TextStyles.h2, fontSize: 22, lineHeight: 30 },
                            styles.questionTitle,
                        ]}>{text}</Text>
                    </View>
                    <View style={styles.buttonsWrap}>
                        {answers.map((answer, index) =>
                            <Button
                                key={`${answer.text}_${index}`}
                                buttonForm
                                title={answer.text}
                                style={[
                                    styles.button,
                                ]}
                                onPress={() => nextStep(index, answer.route)}
                            />,
                        )}
                    </View>
                </Container>
            </ScrollView>
        );
    }

    return (
        <MasloPage onClose={onClose} onBack={previousStep} style={BaseStyles.page}>
            <PersonaScrollMask />
            {!!totalCount &&
                <ProgressBarHaflCircle
                    title={!isFinalScreen ? `${stepIndex + 1} OF ${totalCount}` : 'DONE'}
                    animationStep={1 / totalCount}
                    progress={progress01}
                    diameter={progressBarDiameter}
                    style={[styles.progressBar, { opacity: (isFinalScreen || intermission) ? 0 : 1 }]}
                    titleStyle={styles.progressBarTitle}
                    gradient={gradColors}
                />
            }
            {content}
        </MasloPage>
    );
}

const styles = StyleSheet.create({
    formScrollWrapper: {
        zIndex: 0,
        elevation: 0,
        minHeight: Layout.window.height,
        paddingTop: Layout.getViewHeight(26.4),
    },
    scrollableContainer: {
        height: '100%',
    },
    finalContainer: {
        opacity: 0,
    },
    textBlock: {
        marginBottom: 43,
    },
    title: {
        justifyContent: 'center',
        textAlign: 'center',
        marginBottom: 16,
    },
    questionTitle: {
        justifyContent: 'center',
        textAlign: 'center',
        lineHeight: 39,
    },
    buttonsWrap: {
        width: '100%',
        marginBottom: -14,
    },
    button: {
        marginBottom: 14,
    },
    progressBar: {
        position: 'absolute',
        alignSelf: 'center',
        top: -progressBarDiameter / 2,
        width: progressBarDiameter,
        height: progressBarDiameter,
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 2,
        elevation: 2,
    },
    progressBarTitle: {
        bottom: -29,
        color: Colors.ProgressBarCircle.ProgressBarCircleText,
    },
});
