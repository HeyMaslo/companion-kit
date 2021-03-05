import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';

import { styles } from 'react-native-markdown-renderer';

const minContentHeight = 460;

@observer
export class qolStartView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1.5 } });
    }

    async start() {}

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    renderContent() {

        return (
            <MasloPage style={this.baseStyles.page} onClose={this.cancel}>
                <Container style={[{ height: this._contentHeight, paddingTop: 130, alignItems: 'center' }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>Welcome!</Text>
                    <Text style={[this.textStyles.p1, styles.message]}>I’m happy you’re here! First, I’ll need to gather some information about your current Quality of Life. Ready to begin?</Text>
                    <Button title="I'M READY" style={styles.readyButton}/>
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
        marginTop: 15,
        textAlign: 'center',
        width: '80%',
        marginBottom: '20%',
    },
    readyButton: {
        width: '70%',
    }
});
