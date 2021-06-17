import { createLogger } from 'common/logger';
import { observer } from 'mobx-react';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import Layout from 'src/constants/Layout';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';

export const logger = createLogger('[endQOL]');

const minContentHeight = 1000;

@observer
export class SelectDomainView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { transition: { duration: 2.2 }});
        this.persona.view = {...this.persona.view, position: { x: this.persona.view.position.x, y: Layout.window.height*0.20} };
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseDomain;
    }
    

    async start() {}

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private onEndSurvey = () => {
        this.trigger(ScenarioTriggers.Next);
    }

    onThreeSelected = () => {
        this.trigger(ScenarioTriggers.Submit)
    }

    renderContent() {
        const [l,mainDomain,r,i] = this.viewModel.getDomainDisplay();
        const selectedDomains = this.viewModel.selectedDomains;
        logger.log('MY_SELECTL', selectedDomains.length);

        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.cancel()}>
                <Container style={[{ height: this._contentHeight, alignItems: 'center' }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>{(selectedDomains.length == 2)? `You have Selected the ${selectedDomains[0].name} & ${selectedDomains[1].name} Domains.` : `You have Selected the ${mainDomain} Domain.`} </Text>
                    <Text style={[this.textStyles.h1, styles.title]}>{selectedDomains.length == 2? 'would you like to choose a third Domain?' : 'would you like to choose an additional focus Domain?' }</Text>
                    <View style ={styles.buttonContainer}>
                        {(selectedDomains.length == 2 || selectedDomains.length == 3) && <Button title='Continue' style={styles.continueButton} onPress={() => this.onThreeSelected()}/>}
                        { selectedDomains.length < 2 && <Button title='No' titleStyles={{color:'black'}} withBorder={true} style={[styles.readyButtonNo, {color: 'red'}]} onPress={() => this.onEndSurvey()}/>}
                        { selectedDomains.length < 2 && <Button title='Yes' style={styles.readyButton} onPress={() => this.cancel()}/>}
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
    buttonContainer: {
        width: '90%',
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        flexDirection: 'row',
        marginBottom: 20
    },
    readyButton: {
        width: '45%',
        height: 45,
    },
    readyButtonNo: {
        width: '45%',
        height: 45,
        backgroundColor: '#ffff',
        borderRadius: 5,
    },
    continueButton: {
        width: '100%',
        height: 50,
    },
    
});
