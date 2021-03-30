import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import { createLogger } from 'common/logger';
import { styles } from 'react-native-markdown-renderer';
import Layout from 'src/constants/Layout';
import AppViewModel from 'src/viewModels';

export const logger = createLogger('[endQOL]');

const minContentHeight = 1000;

@observer
export class SelectDomainView extends ViewState {
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

    private onEndSurvey = () => {
        this.trigger(ScenarioTriggers.Next);
    }

    onThreeSelected = () => {
        this,this.trigger(ScenarioTriggers.Submit)
    }

    renderContent() {
        const [l,mainDomain,r,i] = this.viewModel.getDomainDisplay();
        const selectedDomains = this.viewModel.SelectedDomain;
        logger.log("MY_SELECTL", selectedDomains.length);

        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.cancel()}>
                <Container style={[{ height: this._contentHeight, alignItems: 'center' }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>{(selectedDomains.length == 2)? `You have Selected the ${selectedDomains[0]} & ${selectedDomains[1]} Domain.` : `You have Selected the  ${mainDomain} domain.`} </Text>
                    <Text style={[this.textStyles.h1, styles.title]}>{selectedDomains.length == 2? "would you like to choose a third Domain?" : "would you like to choose an additional focus Domain?" }</Text>
                    <Text style={[this.textStyles.p1, styles.message]}></Text>
                    <View style ={{width: '90%', flex: 1, alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row'}}>
                        {(selectedDomains.length == 2 || selectedDomains.length == 3) && <Button title="Continue" style={styles.continueButton} onPress={() => this.onThreeSelected()}/>}
                    { selectedDomains.length < 2 && <Button title="No" style={[styles.readyButtonNo]} onPress={() => this.onEndSurvey()}/>}
                    { selectedDomains.length < 2 && <Button title="Yes" style={styles.readyButton} onPress={() => this.cancel()}/>}
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
        marginTop: "100%",
        textAlign: 'center',
        width: '90%',
        marginBottom: '20%',
    },
    readyButton: {
        width: '40%',
        height: 50, 
    },
    readyButtonNo: {
        width: '40%',
        height: 50,
        // backgroundColor: '#ffff' 
    },
    continueButton: {
        width: '100%',
        height: 50,
        // backgroundColor: '#ffff' 
    },
    
});
