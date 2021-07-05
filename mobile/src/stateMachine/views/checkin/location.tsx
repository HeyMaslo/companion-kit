import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Container, MasloPage, ButtonBlock } from 'src/components';
import { observer } from 'mobx-react';
import { LocationCardS } from 'src/screens/LocationCard';
import { PersonaStates, ScenarioTriggers } from '../../abstractions';
import { CheckInViewBase } from './checkInViewBase';
import * as Haptics from 'src/services/haptics';
import { Select as SelectVM } from 'common/viewModels';
import { LocationItem } from 'src/viewModels/CreateCheckInViewModel';

const LocationsSelect = observer((props: { model: SelectVM<LocationItem> }) => {
    const m = props.model;
    return (
        <>
            {m.items.map((item, i) => (
                <LocationCardS
                    key={item.key}
                    title={item.label.toUpperCase()}
                    onPress={() => {
                        Haptics.selection();
                        m.index = i;
                    }}
                    active={m.index === i}
                    index={i}
                    location={item.value}
                />
            ))}
        </>
    );
});

const minContentHeight = 412;

@observer
export class LocationView extends CheckInViewBase {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(
            minContentHeight,
        );
    }

    start() {
        super.start();
        this.persona.state = PersonaStates.Tap;
    }

    back = () => {
        if (this.viewModel.showFeelingsScreen) {
            this.trigger(ScenarioTriggers.Secondary);
        } else {
            this.trigger(ScenarioTriggers.Back);
        }
    };

    next = () => {
        this.trigger(ScenarioTriggers.Primary);
    };

    renderContent() {
        const { viewModel } = this;
        const { locationSelect, isLocationSelected } = viewModel;

        return (
            <MasloPage
                withDots
                dotLength={3}
                activeDot={1}
                onClose={this.onClose}
                style={this.baseStyles.page}>
                <Container
                    style={[
                        this.baseStyles.container,
                        this.baseStyles.flexBetween,
                        { height: this._contentHeight },
                    ]}>
                    <View style={[this.baseStyles.textBlock, styles.textBlock]}>
                        <Text
                            style={[
                                this.textStyles.h1,
                                this.baseStyles.textCenter,
                            ]}>
                            {'And where are you \n right now?'}
                        </Text>
                    </View>
                    <View style={styles.locationSelect}>
                        <LocationsSelect model={locationSelect} />
                    </View>
                    <ButtonBlock
                        onOk={this.next}
                        onCancel={this.back}
                        nextDisabled={!isLocationSelected}
                    />
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    locationSelect: {
        width: '100%',
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 'auto',
        marginBottom: 32,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    textBlock: {
        marginBottom: 44,
    },
});
