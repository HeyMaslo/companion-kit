import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { observer } from 'mobx-react';
import { Container, MasloPage, ButtonBlock } from 'src/components';
import { CheckInViewBase } from './checkInViewBase';
import { PersonaStates } from '../../persona';
import { ScenarioTriggers } from '../../abstractions';
import MoodSlider from 'src/screens/components/MoodSlider';

const minContentHeight = 483;

export type MoodViewParams = {
    openedByNotification?: boolean,
};

@observer
export class MoodView extends CheckInViewBase<{}, MoodViewParams> {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: 0, transition: { duration: 1.5 } });

        if (this.params?.openedByNotification) {
            this.viewModel.tryUseQuestionFromNotification();
        }
    }

    start() {
        super.start();
        if (this.persona.state === PersonaStates.Idle) {
            this.persona.state = PersonaStates.Joy;
        }
    }

    next = () => {
        if (this.viewModel.showFeelingsScreen) {
            this.trigger(ScenarioTriggers.Secondary);
        } else {
            this.trigger(ScenarioTriggers.Primary);
        }
    }

    renderContent() {
        const { viewModel } = this;

        return (
            <MasloPage withDots dotLength={3} activeDot={0} onClose={this.cancel} style={this.baseStyles.page}>
                <Container style={[this.baseStyles.container, this.baseStyles.flexBetween, { height: this._contentHeight }]}>
                    <View style={[this.baseStyles.textBlock, styles.textBlock]}>
                        <Text style={[this.textStyles.h1, styles.title]}>{viewModel.firstName}, slide the scale to show me how your day is going</Text>
                    </View>
                    <MoodSlider model={viewModel.moodChooser} style={styles.moodChooser} />
                    <ButtonBlock
                        onOk={this.next}
                        onCancel={this.cancel}
                        // nextDisabled={viewModel.moodChooser.currentMood === null}
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
    moodChooser: {
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
