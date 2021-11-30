import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import { MasloPage, Container, Checkbox, Card, Button } from 'src/components';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Colors from 'src/constants/colors';
import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import Layout from 'src/constants/Layout';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Images from 'src/constants/images';
import AppViewModel from 'src/viewModels';

@observer
export class NotificationsSettingsView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    state = {
        showDatePicker: false,
    };

    get viewModel() {
        return AppViewModel.Instance.Settings.notifications;
    }

    protected get unbreakable() { return false; }

    async start() {
        this.resetPersona(PersonaStates.Question, PersonaViewPresets.TopHalfOut);
        this.viewModel.settingsSynced.on(null);
    }

    componentWillUnmount() {
        this.viewModel.settingsSynced.off(null);
    }

    openDatePicker = () => {
        this.setState({ showDatePicker: true });
    }

    setDate = (date: Date) => {
        if (!date) return;

        this.setState(
            { showDatePicker: false },
            () => this.viewModel.scheduledTime = { hour: date.getHours(), minute: date.getMinutes() },
        );
    }

    closeDatePicker = () => {
        this.setState({ showDatePicker: false });
    }

    renderContent() {
        const { showDatePicker } = this.state;
        const notificationsEnabled = this.viewModel.isEnabled && !this.viewModel.isToggleInProgress;
        const titleText = notificationsEnabled ? 'When do you want to be notified?' : 'Do you want to recieve notifications?';
        const desc = 'Life Area \u0026 Diagnosis';

        return (
            <MasloPage style={this.baseStyles.page}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask />
                    <View style={styles.topBarWrap}>
                        <Button style={styles.backBtn} underlayColor='transparent' onPress={() => this.trigger(ScenarioTriggers.Back)}>
                            <Images.backIcon width={28} height={14} />
                        </Button>
                    </View>
                </Container>
                <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                    <Container style={[this.baseStyles.container, styles.container]}>
                        <Text style={[this.textStyles.h1, styles.title]}>{titleText}</Text>
                        <Card
                            title='Notifications'
                            description={notificationsEnabled ? this.viewModel.scheduleTimeString : 'Off'}
                            style={{ marginBottom: 20 }}
                        >
                            <Switch
                                value={this.viewModel.isEnabled}
                                disabled={this.viewModel.isToggleInProgress}
                                onValueChange={this.viewModel.toggleEnabledState}
                            />
                        </Card>
                        {notificationsEnabled && (
                            <>
                                <Card
                                    title='Customize Notifications'
                                    description={desc}
                                    onPress={() => this.trigger(ScenarioTriggers.Next)}
                                >
                                </Card>
                                <Card
                                    title='Edit Notification Schedule'
                                    description={'Choose the time of day'}
                                    onPress={() => this.setState({ showDatePicker: true })}
                                />
                                <DateTimePicker
                                    isVisible={showDatePicker}
                                    onConfirm={this.setDate}
                                    onCancel={this.closeDatePicker}
                                    mode='time'
                                // TODO test Android
                                // isDarkModeEnabled={Appearance.getColorScheme() === 'dark'}
                                />
                            </>
                        )}
                    </Container>
                </ScrollView>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    topBarWrapWrap: {
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 2,
        elevation: 2,
    },
    topBarWrap: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 72,
        zIndex: 2,
        elevation: 2,
    },
    backBtn: {
        width: 52,
        height: 52,
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    container: {
        minHeight: Layout.window.height,
        paddingTop: Layout.getViewHeight(21),
    },
    title: {
        marginBottom: 40,
        textAlign: 'center',
    },
});
