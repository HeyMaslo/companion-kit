import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { ViewState } from '../base';
import TextStyles from 'src/styles/TextStyles';
import Colors from 'src/constants/colors';
import { Container, TextInput, MasloPage } from 'src/components';
import SignInViewModel from 'src/viewModels/SignInViewModel';
import { magicLinkModal } from '../login/magicLink';
import { TransitionObserver } from 'common/utils/transitionObserver';
import AppQueryService from 'src/services/AppQueryService';
import AppController from 'src/controllers';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';
import { createLogger } from 'common/logger';
import { safeCall } from 'common/utils/functions';
import Layout from 'src/constants/Layout';
import { ScenarioTriggers } from 'src/stateMachine/abstractions';

const isAndroid = Platform.OS === 'android';

export abstract class PasswordBase extends ViewState {
    protected abstract onGoBack: () => any;

    protected abstract onClose: () => any;

    protected abstract title: string;
    protected readonly logger = createLogger(`[${this.constructor.name}]`);

    protected abstract submit: () => any;

    protected get enableGlobalProgressTracking() { return true; }

    constructor(props, ctx) {
        super(props, ctx);

        this._contentHeight = this.persona.setupContainerHeightForceScroll();

        this.viewModel.password.reset();
        this.fadeInContent(500, 420);
    }

    protected async start() {
        const obsv = new TransitionObserver(() => AppQueryService.Instance.query)
            .fireOnce()
            .cb(this.onAppQueryChanged);
        this.disposer.add(obsv);
    }

    protected get viewModel() {
        return SignInViewModel.Instance;
    }

    private get inProgress() { return this.viewModel.inProgress; }

    protected abstract get useOptions(): boolean | 'magicLink';

    protected useMagicLink = () => this.runLongOperation(async () => {
        Keyboard.dismiss();

        // try to send magic link
        const result = await this.viewModel.signInWithMagicLink(true);
        if (!result) {
            return;
        }

        await this.showModal(magicLinkModal(this, this.onGoBack));
    })

    protected forgotPassword = () => this.runLongOperation(async () => {
        Keyboard.dismiss();

        const result: boolean | { result: boolean } | "noInvitation" = await this.viewModel.forgotPassword();

        if (!result) {
            return;
        }

        if (process.appFeatures.USE_MAGIC_LINK) {
            // show modal with magic link stuff
            await this.showModal(magicLinkModal(this, this.onGoBack, { title: 'Check your email for a password reset link' }));
            return;
        }

        this.trigger(ScenarioTriggers.Secondary);
    })

    protected onAppQueryChanged = () => {
        Keyboard.dismiss();
        this.hideModal();
    }

    protected waitForMagicLink(reason: MagicLinkRequestReasons, onReceive: () => any) {
        const id = 'magicLink';
        this.disposer.execute(id);

        const unsub = AppController.Instance.Auth.magicLinkSucceeded.on(r => {
            this.hideModal();

            this.logger.log('Magic link has been succeeded with reason: ', r);
            if (r === reason) {
                unsub();
                safeCall(onReceive);
            }
        });

        this.disposer.add(unsub, id);
        return unsub;
    }

    renderContent() {
        const { keyboard } = this.props.context;
        const containerPadding = Layout.window.height - this._contentHeight + 20;
        const containerHeight = keyboard?.isOpened ? keyboard?.screenY : '100%';
        const scaleDownTitle = this.layout.isSmallDevice || this.layout.window.width < 365;

        const inputMargin = () => {
            if (this.useOptions) {
                return 32;
            }
            if (isAndroid) {
                return 100;
            } else {
                return 40;
            }
        };

        return (
            <KeyboardAvoidingView behavior={isAndroid ? 'padding' : null}>
                <MasloPage
                    onClose={this.onClose}
                    onBack={this.onGoBack}
                    inProgress={this.inProgress}
                    style={[this.baseStyles.page, { justifyContent: 'flex-start', position: 'relative' }]}
                >
                    <Container style={[
                        keyboard?.isOpened ? this.baseStyles.flexCenterBottom : this.baseStyles.flexStart,
                        { height: containerHeight, paddingTop: containerPadding },
                    ]}>
                        <View style={[this.baseStyles.textBlock, styles.textBlock, keyboard?.isOpened ? { position: 'absolute', top: containerPadding } : null]}>
                            <Text style={[scaleDownTitle ? this.textStyles.h3 : this.textStyles.h1, styles.title]}>{this.title}</Text>
                        </View>
                        <TextInput
                            onSubmit={this.submit}
                            model={this.viewModel.password}
                            forceError={this.viewModel.error}
                            autoFocus={this.allowInputAutoFocus}
                            autoCompleteType="password"
                            keyboardType="default"
                            textContentType="newPassword"
                            placeholder="Password"
                            autoCapitalize="none"
                            secureTextEntry
                            styleWrap={{ marginBottom: inputMargin() }}
                        />
                        {this.useOptions && (
                            <View style={[styles.buttons, { marginBottom: isAndroid ? 76 : 16 }]}>
                                {
                                    process.appFeatures.USE_MAGIC_LINK && (
                                        <>
                                            <TouchableOpacity style={styles.linkWrap} onPress={this.useMagicLink}>
                                                <Text style={[TextStyles.p4, styles.link]}>Use Magic Link</Text>
                                            </TouchableOpacity>
                                            <View style={styles.separator} />
                                        </>
                                    )
                                }

                                { this.useOptions !== 'magicLink' ? (
                                    <TouchableOpacity style={styles.linkWrap} onPress={this.forgotPassword}>
                                        <Text style={[TextStyles.p4, styles.link]}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        )}
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
    btnContent: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnIcon: {
        width: 23,
        height: 'auto',
    },
    buttons: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    linkWrap: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    link: {
        color: Colors.enterPassword.linkColor,
    },
    separator: {
        width: 1,
        height: 15,
        backgroundColor: Colors.borderColor,
    },
});
