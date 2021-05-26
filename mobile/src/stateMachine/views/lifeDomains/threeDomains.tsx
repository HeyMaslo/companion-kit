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

const minContentHeight = 500;

@observer
export class ThreeDomainView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1.5 } });
    }

    async start() {}

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    private onStartSurvey = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseDomain;
    }

    renderContent() {
        const selectedDomains = this.viewModel.selectedDomains;

        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.cancel()}>
                <Container style={[{ height: this._contentHeight, paddingTop: 200, alignItems: 'center' }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Choosing more than two focus domains is not recommended</Text>
                    <Text style={[styles.message, {fontSize: 17, fontWeight: '200'}]}> For Optimal Effect, choose 1-2 per month - 3 Domains is Maximum</Text>
                    {/* <Text style={[this.textStyles.p1, styles.message1]}> Three Domains is Maximum</Text> */}
                    {selectedDomains.length < 3 && <Button title="Continue with two domains" style={styles.readyButton} onPress={() => this.onStartSurvey()}/>}
                    {selectedDomains.length < 3 && <Button title="Choose Another Domain" titleStyles={{color:'black'}} withBorder={true} style={styles.readyButtonNo} onPress={() => this.cancel()}/>}
                    {/* {selectedDomains.length == 3 && <Button title="continue" style={styles.readyButton} onPress={() => this.cancel()}/>} */}
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
        lineHeight: 35
    },
    message: {
        marginTop: 15,
        textAlign: 'center',
        width: '80%',
        marginBottom: '10%',
    },
    readyButton: {
        width: '90%',
        margin: 5,
        height: 50
        // backgroundColor: '#ffff'
    },
    readyButtonNo: {
        width: '90%',
        margin: 5,
        backgroundColor: '#ffff',
        height: 45,
        marginTop: 10
    }
});