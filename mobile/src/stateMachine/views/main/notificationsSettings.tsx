import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MasloPage, Container, Checkbox, Card, Button } from 'src/components';
import { NotificationTime } from 'src/helpers/notifications';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Appearance } from 'react-native-appearance';
import Colors from 'src/constants/colors';
import { SettingsNotificationsViewModel } from 'src/viewModels/SettingsNotificationsViewModel';
import Switch from 'dependencies/react-native-switch-pro';

import { isTimeActive } from 'src/helpers/notifications';
import { ScenarioTriggers, PersonaStates } from '../../abstractions';
import { PushToast } from '../../toaster';
import Layout from 'src/constants/Layout';
import { PersonaViewPresets } from 'src/stateMachine/persona';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Images from 'src/constants/images';

const colorScheme = Appearance.getColorScheme();

@observer
export class NotificationsSettingsView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    state = {
        showDatePicker: false,
    };

    private readonly model = new SettingsNotificationsViewModel();

    protected get unbreakable() {
        return false;
    }

    async start() {
        this.resetPersona(
            PersonaStates.Question,
            PersonaViewPresets.TopHalfOut,
        );
        this.model.settingsSynced.on(this.onScheduleSynced);
    }

    componentWillUnmount() {
        this.model.settingsSynced.off(this.onScheduleSynced);
    }

    onScheduleSynced = () => {
        PushToast({ text: 'Changes saved' });
    };

    openDatePicker = () => {
        const prevVal = this.model.schedule[NotificationTime.ExactTime];

        if (prevVal && prevVal.active) {
            this.setDate(null);
            return;
        }

        this.setState({ showDatePicker: true });
    };

    setDate = (date: Date) => {
        const timeMS = date && date.setSeconds(0, 0);

        this.setState({ showDatePicker: false }, () =>
            this.model.toggleTime(NotificationTime.ExactTime, timeMS),
        );
    };

    closeDatePicker = () => {
        this.setState({ showDatePicker: false });
    };

    formatDate(date: number): string {
        const d = new Date(date);
        let hours: number = d.getHours();
        let minutes: number | string = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour 0 should be 12
        minutes = minutes < 10 ? '0' + minutes : minutes;

        return `${hours}:${minutes} ${ampm}`;
    }

    renderContent() {
        const selectedTime = this.model.schedule;
        const { showDatePicker } = this.state;
        const exactActive = isTimeActive(
            selectedTime,
            NotificationTime.ExactTime,
        );
        const exactTime =
            !!selectedTime &&
            !!selectedTime[NotificationTime.ExactTime] &&
            selectedTime[NotificationTime.ExactTime].value;
        const notificationsEnabled =
            this.model.isEnabled &&
            !this.model.isToggleInProgress &&
            selectedTime;
        const titleText = notificationsEnabled
            ? 'When do you want to be notified?'
            : 'Do you want to get notifications?';

        return (
            <MasloPage style={this.baseStyles.page}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask />
                    <View style={styles.topBarWrap}>
                        <Button
                            style={styles.backBtn}
                            underlayColor="transparent"
                            onPress={() => this.trigger(ScenarioTriggers.Back)}>
                            <Images.backIcon width={28} height={14} />
                        </Button>
                    </View>
                </Container>
                <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                    <Container
                        style={[this.baseStyles.container, styles.container]}>
                        <Text style={[this.textStyles.h1, styles.title]}>
                            {titleText}
                        </Text>
                        <Card
                            title="Notifications"
                            description={
                                notificationsEnabled
                                    ? this.model.scheduleTimeString
                                    : 'Off'
                            }
                            style={{ marginBottom: 20 }}>
                            <Switch
                                value={this.model.isEnabled}
                                disabled={this.model.isToggleInProgress}
                                onSyncPress={this.model.toggleEnabledState}
                                width={50}
                                height={24}
                                backgroundActive={Colors.switch.activeBg}
                                backgroundInactive={Colors.switch.inactiveBg}
                                style={styles.switchStyles}
                                circleStyle={{ width: 18, height: 18 }}
                            />
                        </Card>
                        {notificationsEnabled && (
                            <>
                                <Card
                                    title="Morning"
                                    description="From 7 AM to 10 AM"
                                    onPress={() =>
                                        this.model.toggleTime(
                                            NotificationTime.Morning,
                                        )
                                    }>
                                    <Checkbox
                                        checked={
                                            selectedTime[
                                                NotificationTime.Morning
                                            ]
                                        }
                                        onChange={() =>
                                            this.model.toggleTime(
                                                NotificationTime.Morning,
                                            )
                                        }
                                    />
                                </Card>
                                <Card
                                    title="Midday"
                                    description="From 12 PM to 2 PM"
                                    onPress={() =>
                                        this.model.toggleTime(
                                            NotificationTime.Midday,
                                        )
                                    }>
                                    <Checkbox
                                        checked={
                                            selectedTime[
                                                NotificationTime.Midday
                                            ]
                                        }
                                        onChange={() =>
                                            this.model.toggleTime(
                                                NotificationTime.Midday,
                                            )
                                        }
                                    />
                                </Card>
                                <Card
                                    title="Evening"
                                    description="From 6 PM to 10 PM"
                                    onPress={() =>
                                        this.model.toggleTime(
                                            NotificationTime.Evening,
                                        )
                                    }>
                                    <Checkbox
                                        checked={
                                            selectedTime[
                                                NotificationTime.Evening
                                            ]
                                        }
                                        onChange={() =>
                                            this.model.toggleTime(
                                                NotificationTime.Evening,
                                            )
                                        }
                                    />
                                </Card>
                                <Card
                                    title="Exact Time"
                                    description="Set your own time"
                                    style={
                                        exactActive ? styles.exactCard : null
                                    }
                                    onPress={this.openDatePicker}>
                                    <Checkbox
                                        checked={exactActive}
                                        onChange={this.openDatePicker}
                                    />
                                </Card>
                                {exactActive && (
                                    <View style={styles.exactTime}>
                                        <Container
                                            style={[
                                                this.baseStyles.flexRowBetween,
                                                { paddingVertical: 12 },
                                            ]}>
                                            <Text
                                                style={
                                                    this.baseStyles.cardTitle
                                                }>
                                                At
                                            </Text>
                                            <Text
                                                style={{
                                                    ...this.baseStyles
                                                        .cardTitle,
                                                    color:
                                                        Colors
                                                            .notificationsSettings
                                                            .exact.desc,
                                                }}>
                                                {this.formatDate(exactTime)}
                                            </Text>
                                        </Container>
                                    </View>
                                )}
                            </>
                        )}
                    </Container>
                    <DateTimePicker
                        isVisible={showDatePicker}
                        onConfirm={this.setDate}
                        onCancel={this.closeDatePicker}
                        mode="time"
                        // TODO test Android
                        isDarkModeEnabled={colorScheme === 'dark'}
                    />
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
    exactCard: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
        marginBottom: 0,
    },
    exactTime: {
        width: '100%',
        borderColor: Colors.borderColor,
        borderWidth: 1,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    switchStyles: {
        paddingHorizontal: 3,
    },
});
