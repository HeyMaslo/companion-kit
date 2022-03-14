import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { observer } from 'mobx-react';
import { Container, MasloPage, ButtonBlock } from 'src/components';
import { CheckInViewBase } from './checkInViewBase';
import { PersonaStates } from '../../persona';
import { ScenarioTriggers } from '../../abstractions';
import MoodSlider from 'src/screens/components/MoodSlider';

const minContentHeight = 483;

@observer
export class SleepView extends CheckInViewBase {

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: 0, transition: { duration: 1.5 } });
        this.viewModel.sleepChooser.isSleep = true;
    }

    start() {
        if (this.persona.state === PersonaStates.Idle) {
            this.persona.state = PersonaStates.Joy;
        }
    }

    next = () => {
        this.trigger(ScenarioTriggers.Primary);
    }

    renderContent() {
        const viewModel = this.viewModel;
        const theme = this.theme;

        return (
            <MasloPage withDots dotLength={2} activeDot={1} onClose={this.cancel} style={this.baseStyles.page} theme={this.theme}>
                <Container style={[this.baseStyles.container, this.baseStyles.flexBetween, { height: this._contentHeight }]}>
                    <View style={[this.baseStyles.textBlock, styles.textBlock]}>
                        <Text style={[this.textStyles.h1, styles.title]}>Did you wake up feeling refreshed today?</Text>
                    </View>
                    <MoodSlider model={viewModel.sleepChooser} style={styles.chooser} />
                    <ButtonBlock
                        onOk={this.next}
                        onCancel={this.cancel}
                        theme={theme}
                    />
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    textBlock: {
        marginBottom: 39,
    },
    chooser: {
        width: '100%',
        height: 'auto',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: 'auto',
        marginBottom: 44,
    },
    title: {
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
    },
});
