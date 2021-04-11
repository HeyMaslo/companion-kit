import { ViewState } from '../base';
import React from 'react';
import AppViewModel from 'src/viewModels';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import AppController from 'src/controllers';

import { styles } from 'react-native-markdown-renderer';
import { PersonaArmState } from 'dependencies/persona/lib';

const minContentHeight = 460;

@observer
export class qolStartView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1.5 } });
        if (!AppController.Instance.User.localSettings?.current?.qol?.seenOnboardingQol) {
            this.viewModel.updateQolOnboarding();
        }
    }

    async start() {
        await this.viewModel.init();
    }

    public get viewModel() {
        return AppViewModel.Instance.QOL;
    }

    private saveProgress = async() => {
        await this.viewModel.saveSurveyProgress(PersonaArmState.createEmptyArmState());
        this.cancel();
    }
    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private onStartSurvey = () => {
        this.trigger(ScenarioTriggers.Submit);
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

    renderContent() {

        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[{ height: this._contentHeight, paddingTop: 130, alignItems: 'center' }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Welcome!</Text>
                    <Text style={[this.textStyles.p1, styles.message]}>I’m happy you’re here! First, I’ll need to gather some information about your current Quality of Life. Ready to begin?</Text>
                    <Button title="I'M READY" style={styles.readyButton} onPress={() => this.onStartSurvey()}/>
                </Container>
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
        marginTop: 15,
        textAlign: 'center',
        width: '80%',
        marginBottom: '20%',
    },
    readyButton: {
        width: '70%',
    }
});
