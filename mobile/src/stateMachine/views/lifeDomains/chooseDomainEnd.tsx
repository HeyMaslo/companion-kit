import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import { createLogger } from 'common/logger';
// import { styles } from 'react-native-markdown-renderer';
import Layout from 'src/constants/Layout';
import AppViewModel from 'src/viewModels';
import AppController from 'src/controllers';

export const logger = createLogger('[endQOL]');

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
    

    async start() {
        // logger.log("IN_SELECT_DOMAIN",this.viewModel.getDomain);
    }

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
        logger.log("MY_SELECTL", selectedDomains.length);

        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.cancel()}>
                <Container style={[{ height: this._contentHeight, alignItems: 'center'}]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Next, you'll choose strategies for your focus domains </Text>
                    <View style ={{width: '90%', flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
                    <Text style={[this.textStyles.p3, styles.message]}>You can choose upto 4 strategies and update them weekly </Text>
                       <Button title="View Strategies" style={styles.continueButton} onPress={() => this.onThreeSelected()}/>
                    </View>
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
        marginTop: "120%",
        textAlign: 'center',
        width: '90%',
        // paddingTop: 50,
        fontSize: 19
        // marginBottom: '20%',
    },
    readyButton: {
        width: '40%',
        height: 50, 
    },
    continueButton: {
        width: '100%',
        height: 50,
        // backgroundColor: '#ffff' 
    },
    
});
