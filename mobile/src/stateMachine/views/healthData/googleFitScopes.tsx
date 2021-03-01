import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text, Animated, ScrollView, Alert, Platform} from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';
import Localization from 'src/services/localization';

import { Link, Button, MasloPage, AnimatedContainer, Container, Card, Checkbox, ButtonBlock } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import * as Features from 'common/constants/features';
import Layout from 'src/constants/Layout';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Switch from 'dependencies/react-native-switch-pro';
import logger from 'common/logger';
import GoogleFit, { Scopes } from 'react-native-google-fit';


const minContentHeight = 344;
// var isAuth = false;

const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
    //   Scopes.FITNESS_ACTIVITY_WRITE,
    //   Scopes.FITNESS_BODY_READ,
    //   Scopes.FITNESS_BODY_WRITE,
    //   Scopes.FITNESS_LOCATION_READ,
      // Scopes.FITNESS_AUTH,
    ]
  }

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

    

    async start() {
        // 

        if (Platform.OS == "android") {
            logger.log("GOOGLE CONSENT = ", GoogleFit.isAuthorized)
            return await GoogleFit.checkIsAuthorized().then (() => {
                logger.log("GOOGLE CONSENT2 = ", GoogleFit.isAuthorized)
                if (!GoogleFit.isAuthorized) {
                    Alert.alert(
                        "AUTH_ERROR",
                        "Click Reload button to re-authorize.",
                        [
                        //   {
                        //     text: "Cancel",
                        //     onPress: () => {},
                        //     style: "cancel"
                        //   },
                        { text: "RELOAD", onPress: () => this.giveAccess() }
                        ],
                        { cancelable: false }
                    );
                    // Alert.alert(
                    //     'Permission Error',
                    //     'Looks like you have denied health data access.We need this data to ensure better experience, please update in OS settings, see CHANGE MY PERMISSIONS.',
                    // );
                }
            })
        }
    }
    giveAccess = () => {
        GoogleFit.authorize(options).then(authResult => {
            logger.log("IN AUTHORIZE", GoogleFit.isAuthorized)
            if (authResult.success) {
               this.trigger(ScenarioTriggers.Submit)
             } else {
                Alert.alert(
                    "Permissions Not Granted",
                    "We need your health data to enhance your experience with app, change this in settings by clicking the profile icon below"
                );
                this.trigger(ScenarioTriggers.Primary)
             }
            }).catch(() => {
                Alert.alert(
                  "AUTH_ERROR",
                  "Click Reload button to re-authorize.",
                  [
                    {
                      text: "Cancel",
                      onPress: () => {},
                      style: "cancel"
                    },
                    { text: "OK", onPress: () => this.giveAccess() }
                  ],
                  { cancelable: false }
                );
                return false;
            })

    }

    onNext = () => {
        this.trigger(ScenarioTriggers.Primary)
    }
    renderContent() {
        const texts = Localization.Current.MobileProject;
        const containerPadding = Layout.window.height - this._contentHeight;
        const titleText = "Health Data"
        const explaining = "We need the following scopes to enhance your experience"
        const more = "check or uncheck and click save to update permission"
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
                    <Text style={[this.textStyles.p3, styles.title]}>{more}</Text>
                    <Card
                        title="Grant Permission"
                        description={Platform.OS =='android'? GoogleFit.isAuthorized? 'ON': 'OFF' : "IOS"}
                        style={{ marginBottom: 20 }}
                    >
                        <Switch
                            value={Platform.OS == 'android'? GoogleFit.isAuthorized : false}
                            // disabled={this.model.isToggleInProgress}
                            // onSyncPress={this.model.toggleEnabledState}
                            width={50}
                            height={24}
                            backgroundActive={Colors.switch.activeBg}
                            backgroundInactive={Colors.switch.inactiveBg}
                            style={styles.switchStyles}
                            circleStyle={{ width: 18, height: 18 }}
                        />
                    </Card>
                    {(Platform.OS == 'android' && GoogleFit.isAuthorized) && (
                        <>
                            <Card
                                title="Activity Samples"
                                description={"Allows to show activity based on your movements"}
                                Image={Images.difficultIcon}
                                // onPress={() => this.model.toggleTime(NotificationTime.Morning)}
                            >
                                <Checkbox
                                    checked={Platform.OS == 'android'? GoogleFit.isAuthorized: false}
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
                                    checked={Platform.OS == 'android'? GoogleFit.isAuthorized: false}
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
                                    checked={Platform.OS == 'android'? GoogleFit.isAuthorized: false}
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
                                    checked={Platform.OS == 'android'? GoogleFit.isAuthorized: false}
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
                    {!GoogleFit.isAuthorized && (
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
