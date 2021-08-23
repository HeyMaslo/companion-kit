import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text, Platform, Image, Animated } from 'react-native';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';
import Localization from 'src/services/localization';

import { Link, Button, MasloPage, AnimatedContainer } from 'src/components';
import * as AppleAuthentication from 'expo-apple-authentication';

import SignInViewModel from 'src/viewModels/SignInViewModel';
import { ScenarioTriggers } from '../../abstractions';
import * as Features from 'common/constants/features';
import { PersonaArmState } from 'dependencies/persona/lib';

const minContentHeight = 344;

@observer
export class WelcomeView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: 405 });
        this.persona.qolArmMagnitudes = PersonaArmState.createEmptyArmState();
    }

    state = {
        opacity: new Animated.Value(0),
    };

    get enableAppleButton() { return SignInViewModel.Instance.enableAppleButton; }
    get appleSignIn() { return SignInViewModel.Instance.appleSignIn; }

    get globalLoading() { return super.globalLoading || SignInViewModel.Instance.inProgress || !!AppController.Instance.User.user?.client; }
    get enableGlobalProgressTracking() { return true; }

    get legalBlock() {
        const { terms, privacy } = Localization.Current.MobileProject.links;

        return (
            <Text style={[this.textStyles.p4, styles.privacy]}>
                By creating a new account or signing in you agree to our
                { terms && (
                    <>
                        <Link link={terms}> Terms <Text style={{ textTransform: 'lowercase' }}>of</Text> Service</Link> and
                    </>
                )}
                <Link link={privacy}> Privacy Policy</Link>
            </Text>
        );
    }

    async start() {
        Animated.timing(this.state.opacity, {
            toValue: 1, delay: 500, duration: 500,
        }).start();
    }

    goToEmailSignin = () => {
        if (!this.globalLoading) {
            this.trigger(ScenarioTriggers.Secondary);
        }
    }

    googleSignIn = () => {
        if (!this.globalLoading) {
            SignInViewModel.Instance.googleSignIn();
        }
    }

    renderContent() {
        const googleIcon = Images.signInWithGoogle;

        const texts = Localization.Current.MobileProject;

        return (
            <MasloPage style={[this.baseStyles.page]}>
                <AnimatedContainer
                    style={[
                        this.baseStyles.container,
                        styles.container,
                        { opacity: this.state.opacity, height: this._contentHeight },
                    ]}
                >
                    <View style={styles.textBlock}>
                        <Text style={[this.textStyles.h1, styles.title]}>Hi there! I’m {texts.personaName}.{'\n'}And you are?</Text>
                    </View>
                    <View style={{ width: '100%' }}>
                        <Button
                            style={styles.button}
                            onPress={this.googleSignIn}
                        >
                            <Image style={styles.gIcon} source={googleIcon} />
                            <Text style={this.textStyles.btnTitle}>sign in with google</Text>
                        </Button>
                        { Platform.OS === 'ios' && Features.Mobile.SignIn.Apple && this.enableAppleButton ? (
                            <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                                cornerRadius={5}
                                style={styles.button}
                                onPress={this.appleSignIn}
                            />
                        ) : null}

                        <Button
                            title="sign in with email"
                            style={styles.mailButton}
                            titleStyles={styles.mailButtonTitle}
                            onPress={this.goToEmailSignin}
                            isTransparent
                        />
                        <View style={styles.footer}>
                            {this.legalBlock}
                            <Text style={[this.textStyles.p4, styles.version]}>
                                v{AppController.Instance.version.current}{AppController.Instance.version.build}
                                { AppController.Instance.version.hasNext ? (
                                    <Text onPress={AppController.Instance.version.update} > (new version available)</Text>
                                ) : ''}
                            </Text>
                        </View>
                    </View>
                </AnimatedContainer>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
    },
    textBlock: {
        marginBottom: 40,
    },
    title: {
        textAlign: 'center',
    },
    gIcon: {
        width: 19,
        height: 19,
        marginRight: 14,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        height: 65,
        marginBottom: 8,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mailButton: {
        width: '100%',
        height: 65,
        borderColor: Colors.welcome.mailButton.border,
        borderWidth: 1,
    },
    mailButtonTitle: {
        color: Colors.welcome.mailButton.title,
    },
    privacy: {
        maxWidth: '100%',
        width: 295,
        marginTop: 16,
        textAlign: 'center',
        justifyContent: 'center',
    },
    version: {
        textAlign: 'center',
    },
});
