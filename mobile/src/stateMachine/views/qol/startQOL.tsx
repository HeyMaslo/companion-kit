import { ViewState } from '../base';
import React from 'react';
import AppViewModel from 'src/viewModels';
import { observer } from 'mobx-react';
import { StyleSheet, Text } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import { QolSurveyType } from 'src/constants/QoL';
import { PersonaArmState } from 'dependencies/persona/lib';
import AppController from 'src/controllers';

const minContentHeight = 460;

@observer
export class QolStartView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1.5 } });
    }

    async start() {
        await this.viewModel.init();
        const currentQolSettings = AppController.Instance.User.localSettings?.current.qol;

        // If there is a short qol that is partialy complete submit it
        if (currentQolSettings.pendingFullQol && currentQolSettings.pendingShortQol) {
            await this.viewModel.sendSurveyResults();

            if (this.viewModel.isUnfinished) {
                await this.viewModel.saveSurveyProgress(true);
            }
            this.viewModel.qolSurveyType = QolSurveyType.Full;
        }
    }

    public get viewModel() {
        return AppViewModel.Instance.QOL;
    }

    private exitSurvey = async () => {
        await this.viewModel.saveSurveyProgress(true);
        this.viewModel.qolArmMagnitudes = PersonaArmState.createZeroArmState();
        this.trigger(ScenarioTriggers.Cancel);
    }

    private onStartSurvey = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    private onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Are you sure you want to pause the survey?`,
            primaryButton: {
                text: 'yes',
                action: this.exitSurvey,
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            },
            theme: this.theme,
        });
    })

    renderContent() {

        return (
            <MasloPage style={this.baseStyles.page} onClose={AppController.Instance.User.localSettings.current?.onboarding.needsQolOnboarding ? null : () => this.onClose()} theme={this.theme}>
                <Container style={[styles.container, { height: this._contentHeight }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Welcome{(this.viewModel.qolSurveyType === QolSurveyType.Full) ? " back" : ""}!</Text>
                    <Text style={[this.textStyles.p1, styles.message]}> {(this.viewModel.qolSurveyType === QolSurveyType.Full) ?
                        "Welcome to your monthly check-in! We'll start with getting an update on your quality of life." :
                        "I’m happy you’re here! First, I’ll need to gather some information about your current Quality of Life. Ready to begin?"}
                    </Text>
                    <Button title="I'M READY" style={styles.readyButton} onPress={() => this.onStartSurvey()} theme={this.theme} />
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingTop: '30%',
        alignItems: 'center'
    },
    title: {
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
    },
    message: {
        marginTop: 15,
        textAlign: 'center',
        width: '90%',
        marginBottom: '20%',
    },
    readyButton: {
        width: '70%',
    }
});
