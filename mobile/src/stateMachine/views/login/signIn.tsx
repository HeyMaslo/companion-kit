import React from 'react';
import {
    StyleSheet,
    Text,
    KeyboardAvoidingView,
    View,
    Platform,
} from 'react-native';
import { observer } from 'mobx-react';
import { Container, TextInput, MasloPage, ButtonContext } from 'src/components';
import * as Links from 'src/constants/links';
import SignInViewModel from 'src/viewModels/SignInViewModel';
import AppController from 'src/controllers';
import { ViewState } from '../base';
import { ScenarioTriggers } from '../../abstractions';
import { magicLinkModal } from './magicLink';
import Localization from 'src/services/localization';
import Layout from 'src/constants/Layout';
import { AuthProviders } from 'common/abstractions/controlllers/IAuthController';

const isAndroid = Platform.OS === 'android';

@observer
export class SignInView extends ViewState {
    constructor(props, ctx) {
        super(props, ctx);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({
            rotation: 45,
        });

        this.fadeInContent(500, 420);
        this.viewModel.cleanUpVerificationCodeForm();
    }

    get enableGlobalProgressTracking() {
        return true;
    }

    get viewModel() {
        return SignInViewModel.Instance;
    }

    goBack = () => {
        this.trigger(ScenarioTriggers.Back);
    };

    private async submitStandalone() {
        const methods = await this.viewModel.getHasAccount();

        // in standalone mode we should never get 'noaccount'
        if (!methods || methods === 'noaccount') {
            return;
        }

        if (methods === 'devLogin') {
            await this.viewModel.devLogin();
            return;
        }

        if (methods.includes(AuthProviders.EmailAndPassword)) {
            // go to password enter state
            this.trigger(ScenarioTriggers.Submit);
            return;
        }

        // there're other sign in options except email+password
        // so we have to go with magic link
        if (methods.length > 0) {
            await this.requestMagicLink();
            return;
        }

        // create a passoword and register
        // setPassword => registration
        this.trigger(ScenarioTriggers.Secondary);
    }

    public submit = () =>
        this.runLongOperation(async () => {
            if (process.appFeatures.MOBILE_STANDALONE) {
                await this.submitStandalone();
                return;
            }

            if (process.appFeatures.USE_MAGIC_LINK) {
                await this.requestMagicLink();
                return;
            }

            await this.sendVerificationCodeByEmail();
        });

    private async sendVerificationCodeByEmail() {
        const data = await this.viewModel.sendVerificationCodeByEmail();

        if (data === 'noInvitation') {
            this.trigger(ScenarioTriggers.Cancel);
            return;
        }

        if (data === 'usePassword') {
            // go to password enter state
            this.trigger(ScenarioTriggers.Submit);
            return;
        }

        if (data === 'invalidEmail') {
            return;
        }

        this.trigger(ScenarioTriggers.Primary);
    }

    private async requestMagicLink() {
        // try to send magic link
        const result = await this.viewModel.signInWithMagicLink();

        if (result === 'noaccount') {
            await this.noAccountModal();
            return;
        }

        if (!result || result === 'devLogin') {
            return;
        }

        if (result === 'usePassword') {
            // go to password enter state
            this.trigger(ScenarioTriggers.Submit);
            return;
        }

        // show modal with magic link stuff
        await this.showModal(magicLinkModal(this));
    }

    noAccountModal = () => {
        return this.showModal({
            title: Localization.Current.MobileProject.missingAccountTitle,
            message:
                Localization.Current.MobileProject.missingAccountDescription,
            primaryButton: {
                text: Localization.Current.TryAgain,
                action: () => {
                    this.viewModel.email.reset();
                    this.viewModel.email.focused = true;
                    this.hideModal();
                },
            },
            secondaryButton: {
                customRender: () =>
                    ButtonContext({
                        text: Localization.Current.ThinkItsAMistake,
                        buttonText: Localization.Current.ContactUs,
                        onPress: () =>
                            Links.tryOpenLink(
                                Localization.Current.MobileProject
                                    .contactUsLink,
                                false,
                            ),
                    }),
            },
        });
    };

    async start() {
        // no-op
    }

    renderContent() {
        const model = SignInViewModel.Instance;
        const { inProgress, error } = model;
        const { keyboard } = this.props.context;
        const containerPadding =
            Layout.window.height - this._contentHeight + 20;
        const containerHeight = keyboard?.isOpened ? keyboard?.screenY : '100%';
        const scaleDownTitle =
            this.layout.isSmallDevice || this.layout.window.width < 365;

        return (
            <KeyboardAvoidingView behavior={isAndroid ? 'padding' : null}>
                <MasloPage
                    inProgress={inProgress || AppController.Instance.loading}
                    onBack={this.goBack}
                    style={[
                        this.baseStyles.page,
                        { justifyContent: 'flex-start', position: 'relative' },
                    ]}>
                    <Container
                        style={[
                            keyboard?.isOpened
                                ? this.baseStyles.flexCenterBottom
                                : this.baseStyles.flexStart,
                            {
                                height: containerHeight,
                                paddingTop: containerPadding,
                            },
                        ]}>
                        <View
                            style={[
                                this.baseStyles.textBlock,
                                styles.textBlock,
                                keyboard?.isOpened
                                    ? {
                                          position: 'absolute',
                                          top: containerPadding,
                                      }
                                    : null,
                            ]}>
                            <Text
                                style={[
                                    scaleDownTitle
                                        ? this.textStyles.h3
                                        : this.textStyles.h1,
                                    styles.title,
                                ]}>
                                {
                                    "What's your email?\nI need it to find your account."
                                }
                            </Text>
                        </View>
                        <TextInput
                            onSubmit={this.submit}
                            model={model.email}
                            placeholder="your@email.com"
                            forceError={error}
                            autoFocus={this.allowInputAutoFocus}
                            autoCompleteType="email"
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            autoCapitalize="none"
                            styleWrap={{ marginBottom: isAndroid ? 100 : 40 }}
                        />
                    </Container>
                </MasloPage>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
    },
    textBlock: {
        marginBottom: 53,
    },
});
