import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text, Animated, ScrollView, Alert, Platform} from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';
import Localization from 'src/services/localization';
import { PushToast } from '../../toaster';

import { Link, Button, MasloPage, AnimatedContainer, Container, Card, Checkbox, ButtonBlock } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Layout from 'src/constants/Layout';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Switch from 'dependencies/react-native-switch-pro';
import { HealthPermissionsViewModel } from 'src/viewModels/HealthPermissionsViewModel';


const minContentHeight = 344;

@observer
export class GoogleFitScopesView extends ViewState {
    constructor(props) {
        super(props);
        // this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: 405 });
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    state = {
        opacity: new Animated.Value(0),
    };

    private readonly model = new HealthPermissionsViewModel();


    async start() {
        this.model.settingsSynced.on(this.onScheduleSynced);
    }
    componentWillUnmount() {
        this.model.settingsSynced.off(this.onScheduleSynced);
    }

    onScheduleSynced = () => {
        PushToast({ text: 'Changes saved' });
    }

    onNext = () => {
        this.trigger(ScenarioTriggers.Primary)
    }
    renderContent() {
        // const texts = Localization.Current.MobileProject;
        // const containerPadding = Layout.window.height - this._contentHeight;
        const permissionsEnabled = this.model.isEnabled && !this.model.isToggleInProgress;
        const titleText = permissionsEnabled?  "Health Data" : "Health Data Missing";
        const explaining = permissionsEnabled? "": "We need the following scopes to enhance your experience";
        // const more = "check or uncheck and click save to update permission"
        return (
        <MasloPage style={this.baseStyles.page}>
            <Container style={styles.topBarWrapWrap}>
                <PersonaScrollMask />
                <View style={styles.topBarWrap}>
                    <Button style={styles.backBtn} underlayColor="transparent" onPress={() => this.trigger(ScenarioTriggers.Back)}>
                        <Images.backIcon width={28} height={14} />
                    </Button>
                </View>
            </Container>
            <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                <Container style={[this.baseStyles.container, styles.container]}>
                    <Text style={[this.textStyles.h1, styles.title]}>{titleText}</Text>
                    <Text style={[this.textStyles.p2, styles.title]}>{explaining}</Text>
                    {/* <Text style={[this.textStyles.p3, styles.title]}>{more}</Text> */}
                    <Card
                        title="Permissions"
                        description={permissionsEnabled ? "ON" : 'Off' }
                        style={{ marginBottom: 20 }}
                    >
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
                    {permissionsEnabled && (
                        <>
                            <Card
                                title="Activity Samples"
                                description={"Allows to show activity based on your movements"}
                                Image={Images.difficultIcon}
                                // onPress={() => this.model.toggleTime(NotificationTime.Morning)}
                            >
                                <Checkbox
                                    checked={Platform.OS == 'android'? permissionsEnabled: false}
                                    onChange={() => null}
                                />
                            </Card>
                            <Card
                                title="Heart Rate"
                                description="Allows us to collect heart rate data"
                                Image={Images.veryPositiveIcon}
                                // onPress={() => this.model.toggleTime(NotificationTime.Midday)}
                                >
                                    <Checkbox
                                    checked={Platform.OS == 'android'? permissionsEnabled: false}
                                    onChange={() => null}
                                />
                            </Card>
                            <Card
                                title="Steps"
                                description="Helps show amount of active steps"
                                Image={Images.busIcon}
                                // onPress={() => this.model.toggleTime(NotificationTime.Evening)}
                                >
                                    <Checkbox
                                    checked={Platform.OS == 'android'? permissionsEnabled: false}
                                    onChange={() => null}
                                />
                            </Card>
                            <Card
                                title="Body Weight and Height"
                                description="help calculate your BMI index and adds value to stats"
                                Image={Images.keyIcon}
                                // style={exactActive ? styles.exactCard : null}
                                // onPress={this.openDatePicker}
                                >
                                    <Checkbox
                                    checked={Platform.OS == 'android'? permissionsEnabled: false}
                                    onChange={() => null}
                                />
                            </Card>
                            {false && (
                                    <View style={styles.exactTime}>
                                        <Container style={[this.baseStyles.flexRowBetween, { paddingVertical: 12 }]}>
                                            <Text style={this.baseStyles.cardTitle}>At</Text>
                                            {/* <Text style={{...this.baseStyles.cardTitle, color: Colors.notificationsSettings.exact.desc}}>{this.formatDate(exactTime)}</Text> */}
                                        </Container>
                                    </View>
                                )}
                        </>
                    )} 
                    {false && (
                        <View style={styles.buttonView}>
                        <Button
                       title="Change my Permissions"
                       style={styles.mailButton}
                       titleStyles={styles.mailButtonTitle}
                       onPress={this.onNext}
                       isTransparent
                        />
                        </View>
                    )}
                     
                </Container>
                {/* <DateTimePicker
                    isVisible={showDatePicker}
                    onConfirm={this.setDate}
                    onCancel={this.closeDatePicker}
                    mode="time"
                    // TODO test Android
                    isDarkModeEnabled={colorScheme === 'dark'}
                /> */}
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
mailButtonTitle: {
    color: Colors.welcome.mailButton.title,
},
mailButton: {
    width: '80%',
    height: 55,
    borderColor: Colors.welcome.mailButton.border,
    borderWidth: 0.5,
},
buttonView : {
    paddingTop: 20,
    paddingLeft: 50
    
},
});
