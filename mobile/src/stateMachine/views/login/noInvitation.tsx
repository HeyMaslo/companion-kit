import { observer } from 'mobx-react';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Container, MasloPage, TextInput } from 'src/components';
import Layout from 'src/constants/Layout';
import AppController from 'src/controllers';
import NoInvitationViewModel from 'src/viewModels/NoInvitationViewModel';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import Colors from 'src/constants/colors';

const isAndroid = Platform.OS === 'android';

@observer
export class NoInvitationView extends ViewState {
    constructor(props, ctx) {
        super(props, ctx);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({
            rotation: 45,
        });

        this.fadeInContent(500, 420);
    }

    get enableGlobalProgressTracking() {
        return true;
    }

    goBack = () => {
        this.trigger(ScenarioTriggers.Back);
    };

    async start() {
        // no-op
    }

    public submit = () => {
        this.trigger(ScenarioTriggers.Back);
    };

    renderContent() {
        const model = NoInvitationViewModel.Instance;
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
                                    "I'm sorry, I am working with only invitation at the moment."
                                }
                            </Text>
                            <Text
                                style={[
                                    Layout.isSmallDevice
                                        ? this.textStyles.p2
                                        : this.textStyles.p1,
                                    styles.desc,
                                ]}>
                                Please give me your email address, and I can
                                contact you in the future when we open up the
                                companion to general users.
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
    desc: {
        textAlign: 'center',
        marginTop: 12,
        width: '100%',
        color: Colors.secondarySubtitle,
    },
});
