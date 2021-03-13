import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';

import { styles } from 'react-native-markdown-renderer';

const minContentHeight = 560;

@observer
export class qolPhysical extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1 }, scale: 0.8 });
    }

    async start() {}

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Do you really want to stop the survey? Your progress will not be saved.`,
            primaryButton: {
                text: 'yes, stop',
                action: this.cancel,
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            }
        });
    })


    renderContent() {
        // TODO: put styles in style sheet and abstract common styles
        // TODO: see if there are styles in basestyles that work
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.onClose()}>
                <Container style={[{ height: this._contentHeight, paddingTop: 70, paddingBottom: 15 }]}>
                    <View style={{alignItems: 'center', width: '100%'}}>
                        <Text>1 of 50</Text>
                    </View>
                    <Text style={{marginTop: '8%'}}>OVER THE LAST 7 DAYS I HAVE...</Text>
                    <View style={{alignItems: 'center', width: '100%'}}>
                        <Text style={[this.textStyles.h1, {marginVertical: '10%'}]}>Had plenty of energy</Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.buttonContainer}>
                            <Button title="STRONGLY AGREE" style={styles.buttons}></Button>
                            <Button title="AGREE" style={styles.buttons}></Button>
                            <Button title="NEUTRAL" style={styles.buttons}></Button>
                            <Button title="DISAGREE" style={styles.buttons}></Button>
                            <Button title="STRONGLY DISAGREE" style={styles.buttons}></Button>
                    </ScrollView>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
    title: {
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
        height: 370,
        justifyContent: 'space-between',
        paddingBottom: 50
    },
    buttons: {
        height: 60,
        width: '90%',
    }
});
