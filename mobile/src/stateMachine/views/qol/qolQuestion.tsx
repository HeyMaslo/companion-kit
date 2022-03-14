import { ViewState } from '../base';
import React from 'react';
import AppViewModel from 'src/viewModels';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, Dimensions, Animated } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import TextStyles from '../../../../src/styles/TextStyles';
import AppController from 'src/controllers';

const minContentHeight = 40;

@observer
export class QolQuestion extends ViewState {

    labelState = {
        opacity: new Animated.Value(1),
    };

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -140 - (this.viewModel.domainNum * 30), transition: { duration: 1 }, scale: 0.8 });
        this.viewModel.originalArmMagnitudes = this.persona.qolArmMagnitudes;
        this.persona.qolArmMagnitudes = this.viewModel.qolArmMagnitudes;
    }

    public get viewModel() {
        return AppViewModel.Instance.QOL;
    }

    async start() { }

    private cancel = () => {
        this.persona.qolArmMagnitudes = this.viewModel.originalArmMagnitudes;
        this.trigger(ScenarioTriggers.Cancel);
    }

    // Called when survey is completed
    private finish = async () => {
        this.trigger(ScenarioTriggers.Submit);
        await this.viewModel.sendSurveyResults();

        if (this.viewModel.isUnfinished) {
            await this.viewModel.saveSurveyProgress(null);
        }
        this.viewModel.updatePendingQol();
    }

    private isNextDomain = (currQuestion: number) => {
        return (currQuestion + 1) % (this.viewModel.domainQuestionCount) === 1 && (currQuestion !== 1);
    }

    private animateDomainChange(goBack?: boolean) {
        Animated.timing(this.labelState.opacity, {
            toValue: 0,
            delay: 0,
            duration: 20,
            useNativeDriver: true,
        }).start(() => {
            this.viewModel.nextQuestion(goBack);
            this.persona.view = { ...this.persona.view, rotation: (this.persona.view.rotation - 30), transition: { duration: 1 } };
            Animated.timing(this.labelState.opacity, {
                toValue: 1,
                delay: 200,
                duration: 900,
                useNativeDriver: true,
            }).start();
            this.checkForInterlude();
        });
    }

    private nextQuestion = (prevResponse: number) => {
        this.viewModel.savePrevResponse(prevResponse);
        const newDomainMag: number = this.calculateNewDomainMag(prevResponse);
        this.persona.qolArmMagnitudes = { ...this.persona.qolArmMagnitudes, [this.viewModel.domain]: newDomainMag };

        if (this.viewModel.questionNum === (this.viewModel.numQuestions - 1)) {
            this.finish();
        } else {
            if (this.isNextDomain(this.viewModel.questionNum + 1)) {
                this.animateDomainChange();
            } else {
                this.viewModel.nextQuestion();
            }
        }
    }

    private calculateNewDomainMag = (response: number) => {
        let booster: number = 0;
        if ((this.viewModel.questionNum + 1) % 4 === 1) {
            booster = 0.2;
        }
        const inc: number = response * 3 / 100;
        const oldMag: number = this.persona.qolArmMagnitudes[this.viewModel.domain];
        return oldMag + inc + booster;
    }

    private onBack() {
        if (this.isNextDomain(this.viewModel.questionNum)) {
            this.animateDomainChange(true);
        } else {
            this.viewModel.nextQuestion(true);
        }
    }

    private onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Do you really want to stop the survey? Your progress will be saved.`,
            primaryButton: {
                text: 'yes, stop',
                action: this.cancel,
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            },
            theme: this.theme,
        });
    })

    private checkForInterlude() {
        if (this.viewModel.showInterlude && this.viewModel.questionNum === this.viewModel.numQuestions / 2) {
            this.showInterlude();
        }
    }

    private showInterlude = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `You're getting there!`,
            message: `You're doing great! I have a couple more questions for you.`,
            primaryButton: {
                text: 'CONTINUE',
                action: this.hideModal,
            },
            theme: this.theme,
        });
    })

    renderContent() {
        const theme = this.theme;
        return (
            <MasloPage style={[this.baseStyles.page, { paddingBottom: 40 }]} onBack={this.viewModel.questionNum == 0 ? null : () => this.onBack()} onClose={AppController.Instance.User.localSettings.current?.onboarding.needsQolOnboarding ? null : () => this.onClose()} theme={this.theme}>
                <Container style={[ { height: this._contentHeight }]}>
                <Animated.View style={{ opacity: this.labelState.opacity }}>
                        <Text style={styles.domainLabel}>{this.viewModel.domain.toUpperCase()}</Text>
                    </Animated.View>
                    <View style={styles.subText1}>
                        <Text style={{...this.textStyles.labelMedium, color: theme.colors.highlight}}>{this.viewModel.questionNum + 1} of {this.viewModel.numQuestions}</Text>
                    </View>
                    <Text style={{ ...this.textStyles.labelMedium, color: theme.colors.highlight, marginTop: '6%'}}>OVER THE LAST 7 DAYS I HAVE...</Text>
                    <View style={styles.question}>
                        <Text style={[{...this.textStyles.h1, color: theme.colors.foreground}, styles.questionText]}>{this.viewModel.question}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title='STRONGLY AGREE' style={{ backgroundColor: theme.colors.tint }} titleStyles={{ color: theme.colors.foreground }} theme={theme} onPress={() => this.nextQuestion(5)}></Button>
                        <Button title='AGREE' style={{ backgroundColor: theme.colors.tint }} titleStyles={{ color: theme.colors.foreground }} theme={theme} onPress={() => this.nextQuestion(4)}></Button>
                        <Button title='NEUTRAL' style={{ backgroundColor: theme.colors.tint }} titleStyles={{ color: theme.colors.foreground }} theme={theme} onPress={() => this.nextQuestion(3)}></Button>
                        <Button title='DISAGREE' style={{ backgroundColor: theme.colors.tint }} titleStyles={{ color: theme.colors.foreground }} theme={theme} onPress={() => this.nextQuestion(2)}></Button>
                        <Button title='STRONGLY DISAGREE' style={{ backgroundColor: theme.colors.tint }} titleStyles={{ color: theme.colors.foreground }} theme={theme} onPress={() => this.nextQuestion(1)}></Button>
                    </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    domainLabel: {
        position: 'absolute',
        // marginLeft: '70%',
        right: '2.5%',
        fontFamily: TextStyles.labelMedium.fontFamily,
    },
    subText1: {
        alignItems: 'center',
        width: '100%',
        marginTop: '8%',
    },
    questionText: {
        textAlign: 'center',
    },
    title: {
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        width: Dimensions.get('window').width,
        height: '60%',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 0,
    },
    question: {
        marginTop: '4%',
        alignItems: 'center',
        width: '100%',
    },
});
