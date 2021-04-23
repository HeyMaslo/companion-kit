import { ViewState } from '../base';
import React from 'react';
import AppViewModel from 'src/viewModels';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, Dimensions, Animated } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Colors from '../../../constants/colors';
import TextStyles from '../../../../src/styles/TextStyles';

import { styles } from 'react-native-markdown-renderer';

const minContentHeight = 560;

@observer
export class QolQuestion extends ViewState {

    labelState = {
        opacity: new Animated.Value(1),
    }

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -140 - (this.viewModel.domainNum*30), transition: { duration: 1 }, scale: 0.8 });
        this.viewModel.origMags = this.persona.qolMags;
        this.persona.qolMags = this.viewModel.qolMags;
    }

    public get viewModel() {
        return AppViewModel.Instance.QOL;
    }

    async start() {}

    private saveProgress = async () => {
        await this.viewModel.saveSurveyProgress(this.persona.qolMags);
        this.cancel();
    }

    private cancel = () => {
        this.persona.qolMags = this.viewModel.origMags;
        this.trigger(ScenarioTriggers.Cancel);
    }

    private finish = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    private isNextDomain = (currQuestion: number) => {
        return (currQuestion + 1) % (this.viewModel.domainQuestions) === 1 && (currQuestion !== 1);
    }

    private animateDomainChange = () => {
        Animated.timing(this.labelState.opacity, {
            toValue: 0,
            delay: 0,
            duration: 20,
            useNativeDriver: true
        }).start(() => {
            this.viewModel.nextQuestion();
            this.persona.view = {...this.persona.view, rotation: (this.persona.view.rotation - 30), transition: {duration: 1}};
            Animated.timing(this.labelState.opacity, {
                toValue: 1,
                delay: 200,
                duration: 900,
                useNativeDriver: true
            }).start();
            this.checkForInterlude();
        });        
    }

    private nextQuestion = (prevResponse: number) => {
        this.viewModel.savePrevResponse(prevResponse);
        const newDomainMag: number = this.calculateNewDomainMag(prevResponse);
        this.persona.qolMags = {...this.persona.qolMags, [this.viewModel.domain]: newDomainMag }
        if (this.viewModel.questionNum != (this.viewModel.numQuestions - 1)) {
            if (this.isNextDomain(this.viewModel.questionNum + 1)) { 
                this.animateDomainChange();
            } else {
                this.viewModel.nextQuestion();
            }
        } else {
            this.finish();
        }
    }

    private calculateNewDomainMag = (response: number) => {
        let booster: number = 0;
        if ((this.viewModel.questionNum+1) % 4 === 1) {
            booster = 0.2;
        }
        let inc: number = response * 3 / 100;
        const oldMag: number = this.persona.qolMags[this.viewModel.domain];
        return oldMag + inc + booster;
    }

    private onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Do you really want to stop the survey? Your progress will be saved.`,
            primaryButton: {
                text: 'yes, stop',
                action: this.saveProgress,
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            }
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
            message: "You're doing great! I have a couple more questions for you.",
            primaryButton: {
                text: 'CONTINUE',
                action: this.hideModal,
            }
        });
    })

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[styles.container, { height: this._contentHeight }]}>
                    <Animated.View style={{opacity: this.labelState.opacity}}>
                        <Text style={styles.domainLabel}>{this.viewModel.domain.toUpperCase()}</Text>
                    </Animated.View>
                    <View style={styles.subText1}>
                        <Text style={this.textStyles.p3}>{this.viewModel.questionNum+1} of {this.viewModel.numQuestions}</Text>
                    </View>
                    <Text style={{...this.textStyles.p3, marginTop: '8%'}}>OVER THE LAST 7 DAYS I HAVE...</Text>
                    <View style={styles.question}>
                        <Text style={[this.textStyles.h2, styles.questionText]}>{this.viewModel.question}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="STRONGLY AGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion(5)}></Button>
                        <Button title="AGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion(4)}></Button>
                        <Button title="NEUTRAL" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion(3)}></Button>
                        <Button title="DISAGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion(2)}></Button>
                        <Button title="STRONGLY DISAGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion(1)}></Button>
                    </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
    container: {
        paddingTop: 40,
        paddingBottom: 15
    },
    domainLabel: {
        marginLeft: '70%',
        fontFamily: TextStyles.labelMedium.fontFamily
    },
    subText1: {
        alignItems: 'center',
        width: '100%',
        marginTop: '4%'
    },
    questionText: {
        marginVertical: '5%',
        textAlign: "center"
    },
    title: {
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        width: Dimensions.get('window').width,
        height: '60%',
        justifyContent: 'space-between',
        position: "absolute",
        bottom: 30,
    },
    buttons: {
        height: 60,
        width: '88%',
        backgroundColor: Colors.survey.btnBackgroundColor,
    },
    question: {
        alignItems: 'center',
        width: '100%',
    }
});
