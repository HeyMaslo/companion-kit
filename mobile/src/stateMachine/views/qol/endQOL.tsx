import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, Animated } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import { createLogger } from 'common/logger';
import { styles } from 'react-native-markdown-renderer';
import Layout from 'src/constants/Layout';
import AppViewModel from 'src/viewModels';
import QOLSurveyViewModel from '../../../viewModels/QoLViewModel';

export const logger = createLogger('[endQOL]');

const minContentHeight = 1000;

@observer
export class QolEndView extends ViewState<{ opacity: Animated.Value }> {

    state = {
        opacity: new Animated.Value(0),
    };

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { transition: { duration: 2.2 } });
        this.persona.view = { ...this.persona.view, position: { x: this.persona.view.position.x, y: Layout.window.height * 0.18 } };
    }

    public get viewModel() {
        return AppViewModel.Instance.QOL;
    }

    async start() {
        logger.log("QoL Survey Results:", this.viewModel.surveyResponses);
        Animated.timing(this.state.opacity, {
            toValue: 1,
            delay: 1000,
            duration: 500,
            useNativeDriver: true
        }).start();
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private onEndSurvey = () => {
        AppViewModel.Instance.QOL = new QOLSurveyViewModel();
        this.cancel();
    }

    renderContent() {

        return (
            <MasloPage style={this.baseStyles.page}>
                <Animated.View style={[{ height: this._contentHeight, alignItems: 'center', opacity: this.state.opacity }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Great job! Here are your Quality of Life results.</Text>
                    <Text style={[this.textStyles.p1, styles.message]}>There are 12 different Life Domains within your overall Quality of Life.</Text>
                    <Button title="CONTINUE" style={styles.readyButton} onPress={() => this.onEndSurvey()} />
                </Animated.View>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
    },
    message: {
        marginTop: "95%",
        textAlign: 'center',
        width: '90%',
        marginBottom: '8%',
    },
    readyButton: {
        width: '70%',
    }
});
