import { createLogger } from 'common/logger';
import { observer } from 'mobx-react';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
// import { styles } from 'react-native-markdown-renderer';
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
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { transition: { duration: 2.2 }});
        this.persona.view = {...this.persona.view, position: { x: this.persona.view.position.x, y: Layout.window.height*0.18} };
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseDomain;
    }

    async start() {}

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    async onThreeSelected() {
        let possibleStrategies = await AppController.Instance.User.backend.getPossibleStrategies();
        AppViewModel.Instance.ChooseStrategy.setAvailableStrategies(possibleStrategies);
        this.trigger(ScenarioTriggers.Submit)
    }

    renderContent() {
        const [l,mainDomain,r,i] = this.viewModel.getDomainDisplay();
        const selectedDomains = this.viewModel.selectedDomains;
        logger.log('MY_SELECTL', selectedDomains.length);

        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.cancel()}>
                <Container style={[styles.flexContainer, { height: this._contentHeight, justifyContent: 'space-between',}]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Next, you'll choose strategies for your focus domains </Text>
                    <View style ={{width: '90%', flex: 0, alignItems: 'center', justifyContent: 'space-around', marginBottom: 15}}>
                        <Text style={[this.textStyles.p3, styles.message]}>You can choose up to 4 strategies and update them weekly</Text>
                        <Button title='View Strategies' style={styles.continueButton} onPress={() => this.onThreeSelected()}/>
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
