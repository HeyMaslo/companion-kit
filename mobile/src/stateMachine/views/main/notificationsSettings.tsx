import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView, Switch, Platform } from 'react-native';
import { MasloPage, Container, Card, Button } from 'src/components';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import { PersonaViewPresets } from 'src/stateMachine/persona';
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
            () => this.viewModel.setScheduledTime({ hour: date.getHours(), minute: date.getMinutes() }) ,
        );
    }

    closeDatePicker = () => {
        this.setState({ showDatePicker: false });
    }

    renderContent() {
        const { showDatePicker } = this.state;
        const notificationsEnabled = this.viewModel.isEnabled && !this.viewModel.isToggleInProgress;
        const titleText = notificationsEnabled ? 'When do you want to be notified?' : 'Do you want to recieve notifications?';
        const desc = 'Life Area \u0026 Diagnosis'; // \u0026 is &

        return (
            <MasloPage style={this.baseStyles.page} onBack={() => this.trigger(ScenarioTriggers.Back)} theme={this.theme}>
                <Container style={[this.baseStyles.container, { flexDirection: 'column', flex: 1, paddingTop: 60 }]}>
                    <Text style={[this.textStyles.h1, styles.title]}>{titleText}</Text>
                    <Card
                        title='Notifications'
                        description={notificationsEnabled ? this.viewModel.scheduleTimeString : 'Off'}
                        style={{ marginBottom: 20 }}
                        theme={this.theme}
                        isTransparent
                    >
                        <Switch
                            value={this.viewModel.isEnabled}
                            disabled={this.viewModel.isToggleInProgress}
                            onValueChange={this.viewModel.toggleEnabledState}
                            thumbColor={Platform.OS == 'android' && this.theme.colors.highlight}
                            trackColor={Platform.OS == 'android' && { true: this.theme.colors.highlightSecondary }}
                        />
                    </Card>
                    {notificationsEnabled && (
                        <>
                            <Card
                                title='Customize Notifications'
                                description={desc}
                                onPress={() => this.trigger(ScenarioTriggers.Next)}
                                theme={this.theme}
                                isTransparent
                            >
                            </Card>
                            <Card
                                title='Edit Notification Schedule'
                                description={'Choose the time of day'}
                                onPress={() => this.setState({ showDatePicker: true })}
                                theme={this.theme}
                                isTransparent
                            />
                            <DateTimePicker
                                isVisible={showDatePicker}
                                onConfirm={this.setDate}
                                onCancel={this.closeDatePicker}
                                mode='time'
                                isDarkModeEnabled={false} // by defulat the picker will match the user's light/dark mode; our app is lightly themed so we'll only use the light version
                            />
                        </>
                    )}
                </Container>
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
    title: {
        marginBottom: 40,
        textAlign: 'center',
    },
});
