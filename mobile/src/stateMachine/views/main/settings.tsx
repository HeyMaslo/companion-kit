import { ViewState } from '../base';
import React from 'react';
import ExpoConstants from 'expo-constants';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MasloPage, Container, Button, Card, Link } from 'src/components';
import AppViewModel from 'src/viewModels';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import Localization from 'src/services/localization';
import Images from 'src/constants/images';

import Layout from 'src/constants/Layout';
import { ProfileViewModel } from 'src/viewModels/ProfileViewModel';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import BottomBar from 'src/screens/components/BottomBar';
import { TextStyles } from 'src/styles/BaseStyles';

@observer
export class SettingsView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    protected get unbreakable() { return false; }

    async start() {
        this.model.notifications.init();
    }

    get model() {
        return AppViewModel.Instance.Settings;
    }

    private readonly profileVM = new ProfileViewModel();

    componentWillUnmount() {
        this.model.notifications.dispose();
    }

    logout = () => {
        this.showModal({
            title: 'Are you sure you want to log out?',
            primaryButton: {
                text: 'yes, please',
                action: this.model.logout,
            },
            secondaryButton: {
                text: 'no, I don’t',
                action: null,
            },
            theme: this.theme,
        });
    }

    private onPasswordChange = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    private onEmailChange = () => {
        // this.trigger(ScenarioTriggers.Primary);
    }

    private onNotificationsChange = () => {
        this.trigger(ScenarioTriggers.Primary);
    }

    private renderLinksFooter() {
        const { feedback, terms, privacy } = Localization.Current.MobileProject.links;
        return (
            <Text style={this.textStyles.p4}>
                {!!feedback ? (
                    <>
                        Send
                        <Link link={feedback}> Feedback, </Link>
                    </>
                ) : null}
                <Text style={feedback ? null : { textTransform: 'capitalize' }}>
                    read
                </Text>
                {!!terms ? (
                    <>
                        <Link link={terms}> Terms <Text style={{ textTransform: 'lowercase' }}>of</Text> Service </Link>
                        or
                    </>
                ) : (
                    <> our</>
                )}
                <Link link={privacy}> Privacy Policy</Link>
            </Text>
        );
    }

    renderContent() {
        const authProviderIcon = this.model.authProvider === 'google'
            ? Images.googleIcon
            : Images.envelopeIcon;

        const notificationsEnabled = this.model.notifications.isEnabled && !this.model.notifications.isToggleInProgress;

        return (
            <MasloPage style={this.baseStyles.page} theme={this.theme}>
                <Container style={styles.topBarWrapWrap}>
                    <PersonaScrollMask />
                    {!process.appFeatures.GOALS_ENABLED &&
                        <View style={styles.topBarWrap}>
                            <Button style={styles.backBtn} underlayColor='transparent' onPress={() => this.trigger(ScenarioTriggers.Back)} theme={this.theme}>
                                <Images.backIcon width={28} height={14} />
                            </Button>
                        </View>
                    }
                </Container>
                <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                    <Container style={[this.baseStyles.container, styles.container]}>
                        <Text style={[this.textStyles.h1, styles.title]}>What do you need help with?</Text>
                        {AppController.Instance.version.hasNext ? (
                            <Button
                                style={styles.updateButton}
                                onPress={AppController.Instance.version.update}
                                theme={this.theme}
                            >
                                <Images.darkRefreshIcon style={styles.refreshIcon} />
                                <Text style={[this.textStyles.labelMedium, { letterSpacing: 1.6, color: 'red' }]}>Update Available</Text>
                            </Button>
                        ) : null}
                        <View style={styles.cardsWrap}>
                            <Card
                                title={'Email'}
                                description={AppController.Instance.User?.user?.email}
                                Image={authProviderIcon}
                                onPress={this.onEmailChange}
                                isTransparent
                                theme={this.theme}
                            >
                                {/* <Images.arrowRight width={8} height={8} /> */}
                            </Card>
                            {this.model.disablePassword ? null : (
                                <Card
                                    title={'Password'}
                                    description={this.model.needsCreatePassword ? 'Create password' : 'Change your password'}
                                    Image={Images.keyIcon}
                                    onPress={this.onPasswordChange}
                                    theme={this.theme}
                                >
                                    <Images.arrowRight width={8} height={8} />
                                </Card>
                            )}
                            <Card
                                title={'Notifications'}
                                description={notificationsEnabled ? 'On' : 'Off'}
                                Image={Images.bellIcon}
                                onPress={this.onNotificationsChange}
                                theme={this.theme}
                            >
                                <Images.arrowRight width={8} height={8} />
                            </Card>
                        </View>
                        <View style={[this.baseStyles.flexCenterBottom, styles.bottomBlock]}>
                            <Button
                                title='logout'
                                withBorder
                                isTransparent
                                onPress={this.logout}
                                theme={this.theme}
                            />
                            <AppVersionView />
                            {this.renderLinksFooter()}
                        </View>
                    </Container>
                </ScrollView>
            </MasloPage>
        );
    }
}

function AppVersionView(this: void) {
    const [toggle, setToggle] = React.useState(false);

    return (
        <Text style={[TextStyles.p4, styles.version]} onPress={() => setToggle(!toggle)}>
            {toggle
                ? ExpoConstants.installationId
                : AppController.Instance.version.fullVersion
            }
        </Text>
    );
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
        textAlign: 'center',
        marginBottom: 40,
    },
    cardsWrap: {
        width: '100%',
        marginBottom: 40,
    },
    updateButton: {
        width: '100%',
        height: 40,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    refreshIcon: {
        height: 20,
        width: 20,
        marginRight: 8,
    },
    version: {
        marginTop: 20,
        marginBottom: 4,
    },
    bottomBlock: {
        width: '100%',
        marginTop: 'auto',
        marginBottom: process.appFeatures.GOALS_ENABLED ? 90 : 0,
    },
    switchStyles: {
        paddingHorizontal: 3,
    },
});
