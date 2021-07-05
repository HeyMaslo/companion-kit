import React from 'react';
import { observer } from 'mobx-react';
import { ViewState } from './base';
import { PersonaStates } from '../persona';
import { ScenarioTriggers } from '../abstractions';
import FormView, { FormViewProps } from 'src/screens/components/FormView';
import { AssessmentItem } from 'src/viewModels/AssessmentItemViewModel';
import OnboardingView from 'src/screens/components/OnboardingView';
import {
    AssessmentType,
    IntakeFormTypes,
    ClientIntakeFormIded,
} from 'common/models';

type State = {
    isWelcome: boolean;
    jumpInQuestion: boolean;
};

export type IntakeFormParams = {
    forceAssessment?: AssessmentType;
    showResult?: ClientIntakeFormIded;
};

const DefaultWelcomeMessage: IntakeFormTypes.OnboardQuestion = {
    title: 'Welcome',
    text:
        "We're happy you're here! First, we need to gather some information on how you're feeling.",
    action: 'I’m ready',
};

@observer
export class IntakeFormView extends ViewState<State> {
    state: State = {
        isWelcome: true,
        jumpInQuestion: false,
    };

    private readonly model: AssessmentItem;

    constructor(props, ctx) {
        super(props, ctx);

        const params = this.props.params as IntakeFormParams;

        const forceType = params?.forceAssessment;
        this.model = new AssessmentItem(forceType, params.showResult);

        this.state.isWelcome = !params.showResult;
    }

    async start() {
        this._setPersona();
    }

    private _submit = async (trigger = ScenarioTriggers.Submit) => {
        const result = await this.runLongOperation(this.model.addResponse);
        if (result) {
            this.trigger(trigger);
        }
    };

    private _setPersona = () => {
        if (this.state.isWelcome) {
            this.persona.state = PersonaStates.Joy;
        } else if (this.state.jumpInQuestion) {
            this.persona.state = PersonaStates.Question;
        } else {
            if (this.model.isFinalScreen) {
                this.persona.state = PersonaStates.Yes;
            } else {
                this.persona.state = PersonaStates.Tap;
            }
        }
    };

    private _showJumpInQuestion = () => {
        if (!this.model.jumpInQuestion) {
            this._showTest();
            return;
        }

        this.setState(
            {
                isWelcome: false,
                jumpInQuestion: true,
            },
            this._setPersona,
        );
    };

    private _showTest = () => {
        this.setState(
            { isWelcome: false, jumpInQuestion: false },
            this._setPersona,
        );
    };

    private _nextStep = (index, route) => {
        this.model.nextStep(index, route);
        this._setPersona();
    };

    private _prevStep = () => {
        if (this.model.step) {
            this.model.previousStep();
        } else {
            this._showJumpInQuestion();
        }
    };

    private _onFormClose = (): void | Promise<void> =>
        this.runLongOperation(async () => {
            this.showModal({
                title: 'Are you sure?',
                message:
                    'If you stop the assessment now, you will have to start over',
                primaryButton: {
                    text: 'No, Go Back',
                    action: () => {
                        this.hideModal();
                    },
                },
                secondaryButton: {
                    text: 'Yes, Delete',
                    action: () => {
                        this.trigger(ScenarioTriggers.Cancel);
                    },
                },
            });
        });

    private getOverrideFinalScreen = (
        type: AssessmentType,
    ): (() => JSX.Element) => {
        return null;
    };

    renderContent() {
        if (!this.model?.questions) {
            return null;
        }

        if (this.state.isWelcome) {
            const message = this.model.welcomeMessage || DefaultWelcomeMessage;

            return (
                <OnboardingView
                    content={{
                        title: message.title || DefaultWelcomeMessage.title,
                        description: message.text || DefaultWelcomeMessage.text,
                        primaryButton: {
                            title:
                                message.action || DefaultWelcomeMessage.action,
                            action: this._showJumpInQuestion,
                        },
                        secondaryButton: message.rejectAction
                            ? {
                                  action: () =>
                                      this.trigger(ScenarioTriggers.Cancel),
                                  title: message.rejectAction,
                              }
                            : null,
                        onClose: this._onFormClose,
                    }}
                    personaViewContext={this.persona}
                />
            );
        }

        if (this.state.jumpInQuestion) {
            const message = this.model.jumpInQuestion;
            return (
                <OnboardingView
                    content={{
                        title: message.title,
                        description: message.text,
                        primaryButton: {
                            title: message.action || 'Start assessment',
                            action: this._showTest,
                        },
                        secondaryButton: null,
                        onClose: this._onFormClose,
                    }}
                    personaViewContext={this.persona}
                />
            );
        }

        const {
            step,
            questionsLength,
            stepAnswers,
            questionText,
            isFinalScreen,
            intermission,
        } = this.model;

        if (isFinalScreen) {
            const override = this.getOverrideFinalScreen(this.model.formType);
            if (override) {
                return override();
            }
        }

        const formViewContent: FormViewProps = {
            intermission: intermission,
            text: questionText,
            answers: stepAnswers,
            stepIndex: step,
            totalCount: questionsLength,
            isFinalScreen: isFinalScreen,
            onClose: this._onFormClose,
            nextStep: this._nextStep,
            previousStep: this._prevStep,
            addResponse: this._submit,
            personaViewContext: this.persona,
        };

        return <FormView {...formViewContent} />;
    }
}
