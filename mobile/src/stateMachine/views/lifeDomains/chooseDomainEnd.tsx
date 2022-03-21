import { createLogger } from 'common/logger';
import { observer } from 'mobx-react';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import Layout from 'src/constants/Layout';
import AppController from 'src/controllers';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';

export const logger = createLogger('[chooseDomainEnd]');

const minContentHeight = 1000;

@observer
export class ChooseDomainEndView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { transition: { duration: 2.2 } });
        this.persona.view = { ...this.persona.view, position: { x: this.persona.view.position.x, y: Layout.window.height * 0.18 } };
    }

    private get viewModel() {
        return AppViewModel.Instance.Domain;
    }

    private get strategiesViewModel() {
        return AppViewModel.Instance.Strategy;
    }

    async start() { }

    private onBack = () => {
        this.trigger(ScenarioTriggers.Back);
    }

    async onChooseStrategiesPress() {
        this.viewModel.postFocusedDomains();
        this.strategiesViewModel.updateAvailableStrategiesForSelectedDomains();
        const allSelectedDomains = (this.viewModel.selectedDomains.domains).concat(this.viewModel.selectedDomains.subdomains);
        AppViewModel.Instance.Settings.notifications.setAllDomains(allSelectedDomains);
        if (AppController.Instance.User.localSettings.current?.onboarding.needsDomainOnboarding) {
            this.viewModel.completeDomainOnboarding();
        }
        AppController.Instance.User.localSettings.updateStrategiesConfirmed(false);
        this.trigger(ScenarioTriggers.Submit)
    }

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()} theme={this.theme}>
                <Container style={[styles.flexContainer, { height: this._contentHeight, justifyContent: 'space-between', }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Next, you'll choose strategies for your focus domains </Text>
                    <View style={{ width: '90%', flex: 0, alignItems: 'center', justifyContent: 'space-around', marginBottom: 15 }}>
                        <Text style={[this.textStyles.p3, styles.message]}>You can choose up to 4 strategies and update them weekly</Text>
                        <Button title='View Strategies' style={styles.continueButton} onPress={() => this.onChooseStrategiesPress()} theme={this.theme} />
                    </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    flexContainer: {
        flexDirection: 'column',
        flexWrap: 'nowrap',
        width: '100%',
        flex: 0,
        alignItems: 'center',
    },
    title: {
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        flex: 0,
    },
    message: {
        textAlign: 'center',
        width: '90%',
        fontSize: 19,
        marginBottom: 15,
    },
    readyButton: {
        width: '40%',
        height: 50,
        margin: 5,
    },
    continueButton: {
        width: '100%',
        height: 50,
        margin: 5,
    },

});
