import { createLogger } from 'common/logger';
import { observer } from 'mobx-react';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import AppViewModel from 'src/viewModels';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';

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

    private onBack = () => {
        this.trigger(ScenarioTriggers.Back);
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
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.onBack()}>
                <Container style={[styles.flexContainer, { height: this._contentHeight, paddingTop: '20%', width: '100%', justifyContent: 'space-between' }]}>
                    <View style={styles.flexContainer}>
                        {/* Titles */}
                        <Text style={[this.textStyles.h1, styles.title]}>Choosing more than two targeted life areas is not recommended. </Text>
                        <Text style={styles.message}> For Optimal Effect, choose 1-2 per month - 3 Domains is maximum</Text>
                    </View>
                    <View style={[styles.flexContainer, {marginBottom: 15}]}>
                        {/* Buttons */}
                        {selectedDomains.length < 3 && <Button title='Continue with two Domains' style={styles.readyButton} onPress={() => this.onStartSurvey()}/>}
                        {selectedDomains.length < 3 && <Button title='Choose Another Domain' titleStyles={{color:'black'}} withBorder={true} style={styles.readyButtonNo} onPress={() => this.cancel()}/>}
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
        lineHeight: 35
    },
    message: {
        textAlign: 'center',
        width: '80%',
        marginTop: 20,
        flex: 0,
        fontSize: 17,
        fontWeight: '200',
    },
    readyButton: {
        width: '90%',
        margin: 5,
        height: 50,
        flex: 0,
    },
    readyButtonNo: {
        width: '90%',
        margin: 5,
        backgroundColor: '#ffff',
        height: 45,
        marginTop: 10,
        flex: 0,
    }
});