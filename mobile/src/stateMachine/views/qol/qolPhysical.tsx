import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Colors from '../../../constants/colors';

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
                <Container style={[{ height: this._contentHeight, paddingTop: 90, paddingBottom: 15 }]}>
                    <View style={{alignItems: 'center', width: '100%'}}>
                        <Text style={this.textStyles.p3}>1 of 50</Text>
                    </View>
                    <Text style={{...this.textStyles.p3, marginTop: '10%'}}>OVER THE LAST 7 DAYS I HAVE...</Text>
                    <View style={{alignItems: 'center', width: '100%'}}>
                        <Text style={[this.textStyles.h1, {marginVertical: '6%'}]}>Had plenty of energy</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                            <Button title="STRONGLY AGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true}></Button>
                            <Button title="AGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true}></Button>
                                    <Button title="NEUTRAL" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true}></Button>
                            <Button title="DISAGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true}></Button>
                            <Button title="STRONGLY DISAGREE" style={styles.buttons} titleStyles={{color: Colors.survey.btnFontColor}} withBorder={true}></Button>
                    </View>
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
        height: '72%',
        justifyContent: 'space-between',
        paddingBottom: 40,
        marginTop: 20
    },
    buttons: {
        height: 60,
        width: '90%',
        backgroundColor: Colors.survey.btnBackgroundColor,
    }
});
