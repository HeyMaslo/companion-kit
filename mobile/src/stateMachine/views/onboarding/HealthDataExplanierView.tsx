import React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import { Button, Container, MasloPage } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import { PersonaViewPresets } from 'src/stateMachine/persona';

@observer
export class HealthDataExplanierView extends ViewState {

    constructor(props) {
        super(props);
        this.persona.view = PersonaViewPresets.TopHalfOut;
        this.persona.armsHidden = true;
    }

    async start() { }

    onNext = () => {
        this.trigger(ScenarioTriggers.Next)
    }

    renderContent() {
        return (
            <MasloPage style={[this.baseStyles.page, { paddingBottom: 40 }]} theme={this.theme}>
                <Container style={[{ height: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }]}>
                    <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{'Why is your health data needed?'}</Text>
                    <ScrollView>
                        <Text style={[TextStyles.h2, styles.title, { color: this.theme.colors.foreground }]}>{'PolarUs is collecting your health data to get a better understanding your needs and support you in the best ways possible. Your personal privacy is very important to us— we only use your health data to develop helpful resources for you.'}</Text>
                    </ScrollView>
                    <Button
                        title='I understand'
                        style={{ marginTop: 20 }}
                        onPress={this.onNext}
                        theme={this.theme}
                    // disabled={this.continueButtonDisabled}
                    />
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 40,
        textAlign: 'center',
    }
});