import { observable, transaction, computed } from 'mobx';
import logger from 'common/logger';
import {
    AssessmentType,
    ClientIntakeFormIded,
    IntakeForms,
    IntakeFormTypes,
} from 'common/models';
import AppController from 'src/controllers';
import * as Features from 'common/constants/features';

const EmptyArray: any[] = [];

type AssessmentResult = {
    formType: AssessmentType;
    score: number;
    date: number;
    recommendation: IntakeFormTypes.Recommendation;
};

export class AssessmentItem {
    @observable
    private _loading: boolean = false;

    @observable
    private _error: string;

    @observable
    private stepIndex: number = 0;

    private previousSteps: number[] = [];
    private completedAnswers: number[] = [];

    @observable
    private showIntermission: boolean = true;

    @observable.ref
    private formResult: ClientIntakeFormIded = null;

    public readonly formType: AssessmentType;

    private _disableSubmitOption = false;

    constructor(
        overrideType: AssessmentType = null,
        forceResult: ClientIntakeFormIded = null,
    ) {
        this.formType =
            overrideType ||
            AppController.Instance.User.assessments.nextFormTypeAvailable ||
            null;
        if (forceResult) {
            this.formResult = forceResult;
            this._disableSubmitOption = true;
            this.stepIndex = this.questions.length;
        }
    }

    private get formData() {
        return this.formType ? IntakeForms[this.formType] : null;
    }

    public get questions(): IntakeFormTypes.Question[] {
        return this.formData?.QuestionList || EmptyArray;
    }
    public get welcomeMessage() {
        return this.formData?.WelcomeMessage;
    }
    public get jumpInQuestion() {
        return this.formData?.OnboardMessage;
    }
    public get intermission(): IntakeFormTypes.IntermissionScreen {
        if (this.formData?.Intermissions && this.showIntermission) {
            const interrupt = this.formData.Intermissions.find(
                (i) => i.stepIndex === this.step,
            );
            return interrupt;
        }

        return null;
    }

    get loading() {
        return this._loading;
    }
    get error() {
        return this._error;
    }
    get step() {
        return this.stepIndex;
    }
    get questionsLength() {
        return this.formData?.DynamicForm ? null : this.questions.length;
    }
    get questionText() {
        return this.isStepExists ? this.questions[this.stepIndex].text : '';
    }

    get isFinalScreen() {
        return this.questions.length === this.stepIndex;
    }

    private get isStepExists() {
        return this.questions.length > this.stepIndex;
    }

    get stepAnswers() {
        return this.isStepExists ? this.questions[this.stepIndex].answers : [];
    }

    @computed
    get assessmentResult() {
        if (!this.formResult) {
            return null;
        }

        const score = this.formData.calculateScores(this.formResult?.answers);
        const recommendation = this.formData.scoreToRecommendation(score);
        const result: AssessmentResult = {
            formType: this.formResult.formType,
            score: score,
            date: this.formResult.date,
            recommendation,
        };

        return result;
    }

    addResponse = async () => {
        if (this._disableSubmitOption) {
            return true;
        }

        this._loading = true;
        this._error = '';

        if (!this.formType) {
            throw new Error('Unknown form type to submit!');
        }

        try {
            const entry = await AppController.Instance.User.assessments.addResponse(
                {
                    formType: this.formType,
                    answers: this.completedAnswers,
                },
            );

            this.formResult = entry;

            return true;
        } catch (e) {
            this._error = 'Something went wrong';
            return false;
        } finally {
            this._loading = false;
        }
    };

    private chooseAnswer(answerIndex: number, route?: number) {
        // save current question index to history
        this.previousSteps.push(this.stepIndex);

        // save the answer
        this.completedAnswers[this.completedAnswers.length] = answerIndex;

        transaction(() => {
            if (route === null) {
                // non-linear: finish
                this.stepIndex = this.questions.length;
            } else if (route) {
                // non-linear: route to the next question
                this.stepIndex = route;
            } else {
                // linear: go to the next question
                this.stepIndex += 1;
            }

            if (this.isFinalScreen) {
                // temporary result that can be used on the final screen
                // will be overwritten after form submit
                this.formResult = {
                    id: 'temp-client-generated',
                    formType: this.formType || null,
                    answers: this.completedAnswers,
                };
            }
        });
    }

    nextStep(answerIndex: number, route?: number) {
        if (this.isStepExists) {
            if (this.intermission) {
                this.showIntermission = false;
            } else {
                this.chooseAnswer(answerIndex, route);
                this.showIntermission = true;
            }
        } else {
            logger.warn(
                '[IntakeFormsViewModel] Step value can not be more than questions length',
            );
        }
    }

    previousStep() {
        if (this.stepIndex > 0) {
            this.stepIndex = this.previousSteps.pop();
            this.completedAnswers.pop();
        } else {
            logger.warn(
                '[IntakeFormsViewModel] Step value can not be less than 0',
            );
        }
    }
}
