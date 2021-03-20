import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, Dimensions, Animated } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Colors from '../../../constants/colors';
import QOLSurveyViewModel from "../../../viewModels/QoLViewModel";
import TextStyles from '../../../../src/styles/TextStyles';

import { styles } from 'react-native-markdown-renderer';

const minContentHeight = 560;

@observer
export class qolQuestion extends ViewState {

    labelState = {
        opacity: new Animated.Value(0),
    }

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1 }, scale: 0.8 });
    }

    private readonly model = new QOLSurveyViewModel();

    async start() {
        Animated.timing(this.labelState.opacity, {
            toValue: 1,
            delay: 450,
            duration: 500,
        }).start();
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private finish = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    private isNextDomain = (currQuestion) => {
        return (currQuestion + 1) % (this.model.domainQuestions) === 1 && (currQuestion !== 1);
    }

    private animateDomainChange = () => {
        Animated.timing(this.labelState.opacity, {
            toValue: 0,
            delay: 0,
            duration: 20,
        }).start(() => {
            this.model.nextQuestion();
            this.persona.view = {...this.persona.view, rotation: (this.persona.view.rotation + 30), transition: {duration: 1}};
            Animated.timing(this.labelState.opacity, {
                toValue: 1,
                delay: 200,
                duration: 900,
            }).start();
        });        
    }

    // todo: add UI to show when a response is pressed
    // todo: add encouragement interlude
    private nextQuestion = () => {
        if (this.model.getQuestionNum != (this.model.numQuestions - 1)) {
            if (this.isNextDomain(this.model.getQuestionNum + 1)) { 
                this.animateDomainChange();
            } else {
                this.model.nextQuestion();
            }
        } else {
            this.finish();
        }
    }

    private onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Do you really want to stop the survey? Your progress will not be saved.`,
            primaryButton: {
                text: 'yes, stop',
                action: this.cancel,
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            }
        });
    })


    renderContent() {
        // TODO: put styles in style sheet and abstract common styles
        // TODO: see if there are styles in basestyles that work
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[{ height: this._contentHeight, paddingTop: 40, paddingBottom: 15 }]}>
                    <Animated.View style={{opacity: this.labelState.opacity}}>
                        <Text style={{marginLeft: '70%', fontFamily: TextStyles.labelMedium.fontFamily}}>{this.model.getDomain}</Text>
                    </Animated.View>
                    <View style={{alignItems: 'center', width: '100%', marginTop: '4%'}}>
                        <Text style={this.textStyles.p3}>{this.model.getQuestionNum+1} of {this.model.numQuestions}</Text>
                    </View>
                    <Text style={{...this.textStyles.p3, marginTop: '8%'}}>OVER THE LAST 7 DAYS I HAVE...</Text>
                    <View style={styles.question}>
                        <Text style={[this.textStyles.h2, {marginVertical: '5%', textAlign: "center"}]}>{this.model.getQuestion}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                            <Button title="STRONGLY AGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion()}></Button>
                            <Button title="AGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion()}></Button>
                                    <Button title="NEUTRAL" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion()}></Button>
                            <Button title="DISAGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion()}></Button>
                            <Button title="STRONGLY DISAGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true} onPress={() => this.nextQuestion()}></Button>
                    </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
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
