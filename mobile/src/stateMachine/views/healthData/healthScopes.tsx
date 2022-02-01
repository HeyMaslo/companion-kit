import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text, ScrollView, Platform, Image } from 'react-native';
import { ViewState } from '../base';
import Images from 'src/constants/images';
import { PushToast } from '../../toaster';
import * as Links from 'src/constants/links';
import { Button, MasloPage, Container, Card, Checkbox } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Layout from 'src/constants/Layout';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import { HealthPermissionsViewModel } from 'src/viewModels/HealthPermissionsViewModel';
import TextStyles from 'src/styles/TextStyles';
import AppController from 'src/controllers';
import { authAndroid, checkAndroidAuth } from 'src/helpers/health';
import { auth } from 'firebase-admin';

@observer
export class HealthScopesView extends ViewState {

    private readonly model = new HealthPermissionsViewModel();

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    async start() {
        if (!AppController.Instance.User.healthPermissionsController.permissionsAsked) {
            this.runLongOperation(async () => {
                if (await AppController.Instance.User.healthPermissionsController.askPermission()) {
                    this.trigger(ScenarioTriggers.Cancel);
                }
            })
        }
    }

    onSettings = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'positive',
            title: 'Allow CompanionKit to access your health data',
            message: 'Please grant access from Settings.',
            confirmText: 'Go to settings',
            customView:
                <View>
                    {/* MK-TODO: - this screen's design has not been finalized */}
                    {/* <View style={styles.imageNextToText}>
                    <Image source={Images.iOS_Settings} style={{ width: 26, height: 26 }} />
                    <Text style={[TextStyles.p1, styles.instructionText]}>{'Open iPhone settings'}</Text>
                </View> */}
                    <View style={styles.imageNextToText}>
                        <Image source={Images.iOS_Privacy} style={{ width: 26, height: 26 }} />
                        <Text style={[TextStyles.p1, styles.instructionText]}>{'Tap Privacy'}</Text>
                    </View>
                    <View style={styles.imageNextToText}>
                        <Image source={Images.iOS_Health} style={{ width: 26, height: 26 }} />
                        <Text style={[TextStyles.p1, styles.instructionText]}>{'Tap Health'}</Text>
                    </View>
                    <View style={styles.imageNextToText}>
                        <Image source={Images.iOS_CompanionKit} style={{ width: 26, height: 26 }} />
                        <Text style={[TextStyles.p1, styles.instructionText]}>{'Select CompanionKit'}</Text>
                    </View>
                    <View style={styles.imageNextToText}>
                        <Image source={Images.iOS_Switch} style={{ width: 26, height: 26 }} />
                        <Text style={[TextStyles.p1, styles.instructionText]}>{'Turn All Categories On'}</Text>
                    </View>
                </View>,
            onConfirm: async () => {
                AppController.Instance.PromptModal.closeModal();
                // Sub-optimal ways to open iOS settings
                // const pathParts = ['HEALTH', '&path=', 'Privacy', ':', 'prefs', 'App-']; // Private API could get rejected (obscured here)
                // const path = pathParts.reverse().join(''); 
                const path = 'app-settings:'; // opens CompanionKit specific settings (not health) by using Public API
                await Links.tryOpenLink(path);
            },
        });

    }

    onAndroidSettings = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'positive',
            title: 'Allow CompanionKit to access your Google Fit data',
            message: 'Please grant access to Companion Kit.',
            confirmText: 'Authorize Google Fit',
            customView:
                <View>
                    <View style={styles.imageNextToText}>
                        <Image source={Images.GoogleFitCheckMarkPNG} style={{ width: 26, height: 26 }} />
                        <Text style={[TextStyles.p1, styles.instructionText]}>{'Turn All Categories On'}</Text>
                    </View>
                </View>,
            onConfirm: async () => {
                await authAndroid();
                AppController.Instance.PromptModal.closeModal();
            },
        });

    }
    renderContent() {
        // const enabled = Platform.OS == 'ios' ? this.model.isEnabledOG : this.model.isEnabled;
        // const permissionsEnabled = enabled && !this.model.isToggleInProgress;
        const titleText = 'Health Data';
        const explaining = 'We are collecting your health data to build a better personalized experience for you in the app.';
        const perm = this.model.getPermissions();
        return (
            <MasloPage style={this.baseStyles.page} onBack={() => this.trigger(ScenarioTriggers.Back)} onClose={() => this.trigger(ScenarioTriggers.Cancel)} theme={this.theme}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask />
                </Container>
                <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                    <Container style={[this.baseStyles.container, styles.container]}>
                        <Text style={[this.textStyles.h1, styles.title]}>{titleText}</Text>
                        <Text style={[this.textStyles.p1, styles.subTitle]}>{explaining}</Text>
                        {/* <Card
                            title={`${Platform.OS == 'ios' ? 'HealthKit' : 'GoogleFit'} Data`}
                            description={'Change Authorization'}
                            style={{ marginBottom: 20 }}
                        >
                        </Card> */}
                        {Platform.OS == 'ios' && (
                            <View style={styles.buttonView}>
                                <Button
                                    title='Grant Permission'
                                    onPress={this.onSettings}
                                    theme={this.theme}
                                />
                            </View>
                        )}
                        {Platform.OS == 'android' && !checkAndroidAuth() && (
                            <View style={styles.buttonView}>
                                <Button
                                    title='Grant Permission'
                                    onPress={this.onAndroidSettings}
                                    theme={this.theme}
                                />
                            </View>
                        )}
                        {Platform.OS == 'android' && checkAndroidAuth() && (
                            <View style={styles.buttonView}>
                                <Text>Thank you for granting health permissions.</Text>
                            </View>
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
    subTitle: {
        marginBottom: 40,
        textAlign: 'center',
        color: 'grey',
        borderStartWidth: 23,
        borderEndWidth: 23
    },
    mailButton: {
        width: 320,
        height: 50,
        borderColor: 'white',
        borderWidth: 0.25,
        backgroundColor: '#f3f3f3',
        padding: 5
    },
    buttonView: {
        alignContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    imageNextToText: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionText: {
        marginLeft: 12,
    },
});
