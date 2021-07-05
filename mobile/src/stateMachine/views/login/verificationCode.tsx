import { observer } from 'mobx-react';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
    TextInput,
    Clipboard,
} from 'react-native';
import { Container, MasloPage } from 'src/components';
import Layout from 'src/constants/Layout';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';
import Colors from 'src/constants/colors';
import SignInViewModel from 'src/viewModels/SignInViewModel';
import TextStyles from 'src/styles/TextStyles';

const isAndroid = Platform.OS === 'android';

@observer
export class VerificationCodeView extends ViewState {
    constructor(props, ctx) {
        super(props, ctx);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({
            rotation: 45,
        });
        this.fadeInContent(500, 420);
        this.viewModel.init();
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

    async start() {
        // no-op
    }

    onVerificationCodeKeyPress = (nativeEvent, index) => {
        if (nativeEvent.key === 'Backspace') {
            if (this.viewModel.verificationCodeValue[index]) {
                if (this.viewModel.errorMsg) {
                    this.viewModel.errorMsg = null;
                }
                this.viewModel.verificationCodeValue[index] = '';
            }
            index !== 0
                ? this.viewModel.inputRefArray[index - 1].focus()
                : null;
        }
    };

    handlePastedContent = async (pastedContent, index) => {
        this.viewModel.isPasting = true;

        pastedContent.split('').forEach((curChar, currPastedIndex) => {
            if (
                index + currPastedIndex >=
                this.viewModel.inputRefArray.length
            ) {
                return;
            }
            this.viewModel.verificationCodeValue[
                index + currPastedIndex
            ] = curChar;
            this.viewModel.inputRefArray[index + currPastedIndex].focus();
        });

        this.viewModel.isPasting = false;

        if (
            pastedContent.length + index >=
            this.viewModel.inputRefArray.length
        ) {
            await this.submitVerificationCode();
        }
    };

    submitVerificationCode = () =>
        this.runLongOperation(async () => {
            const validationResult = await this.viewModel.validateCode();

            if (!validationResult || !validationResult.result) {
                this.viewModel.errorMsg = 'Invalid code';
                return;
            }

            if (this.viewModel.isResettingPassword) {
                this.trigger(ScenarioTriggers.Primary);
                return;
            }

            if (validationResult.hasAccount) {
                this.trigger(ScenarioTriggers.Primary);
                return;
            }

            const data = await this.viewModel.createUser();

            if (!data || !data.result) {
                this.viewModel.errorMsg = 'Failed to create user';
                return;
            }

            this.trigger(ScenarioTriggers.Primary);
        });

    onChangeVerificationCodeText = async (value, index) => {
        if (!value || isNaN(value) || this.viewModel.isPasting) {
            return;
        }

        if (this.viewModel.verificationCodeValue[index]) {
            if (index < this.viewModel.verificationCodeValue.length - 1) {
                this.viewModel.inputRefArray[index + 1].focus();
                this.onChangeVerificationCodeText(value, index + 1);
            }
            return;
        }

        const pastedContent = await Clipboard.getString();
        const isPasted = value.includes(pastedContent);
        if (!!pastedContent && isPasted) {
            this.handlePastedContent(pastedContent, index);
            return;
        }

        let filteredValue = value;
        if (value.length > 1) {
            filteredValue = value.charAt(value.length - 1);
        }

        this.viewModel.verificationCodeValue[index] = filteredValue;
        if (index !== this.viewModel.inputRefArray.length - 1) {
            this.viewModel.inputRefArray[index + 1].focus();
            return;
        }

        await this.submitVerificationCode();
    };

    renderContent() {
        const { inProgress, error } = this.viewModel;
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
                                {'Please enter 6-digit code'}
                            </Text>
                            <Text
                                style={[
                                    Layout.isSmallDevice
                                        ? this.textStyles.p2
                                        : this.textStyles.p1,
                                    styles.desc,
                                ]}>{`I’ve sent it to ${this.viewModel.email.value}`}</Text>
                        </View>
                        <View style={styles.otpBoxesContainer}>
                            {this.viewModel.verificationCodeValue.map(
                                (item, index) => (
                                    <View
                                        style={[
                                            styles.otpBox,
                                            index === 2
                                                ? styles.centerBox
                                                : null,
                                        ]}
                                        key={index}>
                                        <TextInput
                                            value={
                                                this.viewModel
                                                    .verificationCodeValue[
                                                    index
                                                ]
                                            }
                                            ref={(ref) =>
                                                (this.viewModel.inputRefArray[
                                                    index
                                                ] = ref)
                                            }
                                            // maxLength={1}
                                            keyboardType="numeric"
                                            onChangeText={(value) =>
                                                this.onChangeVerificationCodeText(
                                                    value,
                                                    index,
                                                )
                                            }
                                            onKeyPress={({ nativeEvent }) =>
                                                this.onVerificationCodeKeyPress(
                                                    nativeEvent,
                                                    index,
                                                )
                                            }
                                            style={{
                                                height: '100%',
                                                textAlign: 'center',
                                                fontSize: 20,
                                            }}
                                            autoFocus={
                                                index === 0 ? true : false
                                            }
                                        />
                                    </View>
                                ),
                            )}
                        </View>
                        {this.viewModel.errorMsg && (
                            <Text
                                style={[
                                    TextStyles.labelMedium,
                                    styles.errorText,
                                ]}>
                                {this.viewModel.errorMsg}
                            </Text>
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
    desc: {
        textAlign: 'center',
        marginTop: 12,
        width: '100%',
        color: Colors.secondarySubtitle,
    },
    otpBoxesContainer: {
        marginTop: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    otpBox: {
        padding: 0,
        marginRight: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'grey',
        height: 45,
        width: 45,
        textAlign: 'center',
    },
    centerBox: {
        marginRight: 30,
    },
    errorText: {
        left: 0,
        width: '100%',
        textAlign: 'center',
        justifyContent: 'center',
        color: Colors.inputErrorText,
        marginTop: 16,
    },
});
