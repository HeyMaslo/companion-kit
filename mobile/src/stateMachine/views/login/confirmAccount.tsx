import React from 'react';
import {
    StyleSheet,
    Text,
    KeyboardAvoidingView,
    Platform,
    View,
    TextInputProps,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Container, MasloPage, TextInput } from 'src/components';
import { observer } from 'mobx-react';
import { ViewState } from '../base';
import Layout from 'src/constants/Layout';
import Lazy from 'common/utils/lazy';
import ConfirmAccountViewModel, {
    FieldTypes,
} from 'src/viewModels/ConfirmAccountViewModel';
import * as Features from 'common/constants/features';
import { TextInputVM } from 'common/viewModels';
import { ScenarioTriggers } from 'src/stateMachine/abstractions';

const AnimatedContainer = Animatable.createAnimatableComponent(Container);
const Model = new Lazy(() => new ConfirmAccountViewModel());

export { FieldTypes };

type StepInfo = {
    type: FieldTypes;
    request: string;
    model: () => TextInputVM;
    textContentType?: TextInputProps['textContentType'];
    keyboardType?: TextInputProps['keyboardType'];
};

const EnabledSteps: StepInfo[] = [
    {
        type: FieldTypes.FullName,
        request: 'It’s nice to meet you! What is your name?',
        model: () => Model.value.name,
        textContentType: 'name',
    },
    Features.Mobile.ConfirmAccount.CollectZipCode
        ? {
              type: FieldTypes.Zipcode,
              request:
                  'Your zip code will help me find the best jobs in your area',
              model: () => Model.value.zipcode,
              textContentType: 'postalCode',
              keyboardType: 'numbers-and-punctuation',
          }
        : null,
    Features.Mobile.ConfirmAccount.CollectPhoneNumber
        ? {
              type: FieldTypes.PhoneNumber,
              request: 'I can send you important updates to your phone',
              model: () => Model.value.phoneNumber,
              textContentType: 'telephoneNumber',
              keyboardType: 'phone-pad',
          }
        : null,
];

type State = {
    stepIndex: number;
};

export type ConfirmAccountParams = {
    forceSteps?: FieldTypes[];
    goBackOnDone?: boolean;
};

@observer
export class ConfirmAccountView extends ViewState<State, ConfirmAccountParams> {
    state = {
        stepIndex: 0,
    };

    private readonly _steps: StepInfo[];

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll();

        const forceSteps = this.params?.forceSteps || null;
        this._steps = EnabledSteps.filter(
            (s) => s && (!forceSteps || forceSteps.includes(s.type)),
        );
        if (!this._steps.length) {
            throw new Error('No steps available for ConfirmAccount view');
        }
    }

    private get viewModel() {
        return Model.value;
    }
    private get currentStep() {
        return this._steps[this.state.stepIndex] || this._steps[0];
    }
    private get goBackOnDone() {
        return this.params?.goBackOnDone || false;
    }

    start() {
        /* no-op */
    }

    private _goToStep = (index: number) => {
        this.contentAnimation = {
            animation: 'fadeOut',
            delay: 0,
            duration: 300,
        };
        setTimeout(() => {
            this.setState({ stepIndex: index }, () => {
                this.contentAnimation = {
                    animation: 'fadeIn',
                    delay: 0,
                    duration: 300,
                };
            });
        }, 300);
    };

    submit = async () =>
        this.runLongOperation(async () => {
            const isValid = await this.currentStep.model().validate();
            if (!isValid) {
                return;
            }

            const nextIndex = this.state.stepIndex + 1;
            if (nextIndex >= this._steps.length) {
                const result = await this.viewModel.submit(
                    this.params?.forceSteps || undefined,
                );
                if (this.goBackOnDone && result) {
                    this.trigger(ScenarioTriggers.Back);
                }
            } else {
                this._goToStep(nextIndex);
            }
        });

    close = async () => {
        if (this.goBackOnDone) {
            this.trigger(ScenarioTriggers.Back);
        } else {
            await this.viewModel.decline();
        }
    };

    onBack = () => {
        if (this.state.stepIndex > 0) {
            this._goToStep(this.state.stepIndex - 1);
        }
    };

    renderContent() {
        const { keyboard } = this.props.context;
        const containerPadding =
            20 + Layout.window.height - this._contentHeight;
        const containerHeight = keyboard?.isOpened ? keyboard?.screenY : '100%';
        const scaleDownTitle =
            this.layout.isSmallDevice || this.layout.window.width < 365;

        const step = this.currentStep;
        const inputVM = step.model();

        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'android' ? 'padding' : null}
                enabled>
                <MasloPage
                    onBack={this.state.stepIndex > 0 ? this.onBack : null}
                    onClose={this.close}
                    style={[
                        this.baseStyles.page,
                        { justifyContent: 'flex-start' },
                    ]}>
                    <AnimatedContainer
                        animation="fadeIn"
                        duration={500}
                        delay={420}
                        style={[
                            this.baseStyles.container,
                            this.baseStyles.flexStart,
                            {
                                justifyContent: keyboard?.isOpened
                                    ? 'space-between'
                                    : null,
                                paddingTop: containerPadding,
                                height: containerHeight,
                            },
                        ]}>
                        <View style={this.baseStyles.textBlock}>
                            <Text
                                style={[
                                    scaleDownTitle
                                        ? this.textStyles.h3
                                        : this.textStyles.h1,
                                    styles.title,
                                ]}>
                                {step.request}
                            </Text>
                        </View>
                        <TextInput
                            onSubmit={this.submit}
                            model={inputVM}
                            placeholder={inputVM.name}
                            autoFocus
                            styleWrap={styles.inputWrap}
                            keyboardType={step.keyboardType}
                            textContentType={step.textContentType}
                        />
                    </AnimatedContainer>
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
        marginBottom: 53,
    },
    inputWrap: {
        marginBottom: 20,
    },
});
