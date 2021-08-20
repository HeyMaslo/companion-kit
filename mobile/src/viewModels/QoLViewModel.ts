import { observable, computed } from 'mobx';
import { SurveyQuestions, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT } from '../constants/QoLSurvey';
import { PersonaDomains } from '../stateMachine/persona';
import { createLogger } from 'common/logger';
import AppController from 'src/controllers';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import { PartialQol, QolSurveyResults, QolSurveyType } from 'src/constants/QoL';
import { PersonaArmState } from 'dependencies/persona/lib';
import { sum } from 'src/helpers/DomainHelper';

export const logger = createLogger('[QOLModel]');

export default class QOLSurveyViewModel {

    @observable
    private _questionNum: number;
    @observable
    private _domainNum: number;
    private _surveyResponses: QolSurveyResults;
    private _armMagnitudes: PersonaArmState;
    private initModel: Promise<void>;
    public isUnfinished: boolean;
    public originalArmMagnitudes: PersonaArmState;
    public showInterlude: boolean = false;
    public qolSurveyType: QolSurveyType;
    public startDate: number;
    public questionCompletionDates: number[];

    public readonly numQuestions: number = QUESTIONS_COUNT;
    public readonly domainQuestionCount: number = DOMAIN_QUESTION_COUNT;
    private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;


    constructor() {
        this.initModel = AppController.Instance.User.qol.getPartialQol().then((partialQolState: PartialQol) => {
            if (!this._settings.current?.qol?.seenQolOnboarding) {
                this.updateQolOnboarding();
            }
            if (partialQolState !== null && typeof(partialQolState) !== 'undefined') {
                this._questionNum = partialQolState.questionNum;
                this._domainNum = partialQolState.domainNum;
                this._surveyResponses = partialQolState.scores;
                this.startDate = partialQolState.startDate;
                this.questionCompletionDates = partialQolState.questionCompletionDates;
                this._armMagnitudes = this.getArmMagnitudes(partialQolState.scores);
                this.isUnfinished = true;
                this.showInterlude = partialQolState.isFirstTimeQol;
                return;
            } else {
                this.startDate = new Date().getTime();
                this._questionNum = 0;
                this._domainNum = 0;
                const surveyResponses: QolSurveyResults = {};
                for (let domain of PersonaDomains) {
                    surveyResponses[domain] = [];
                }
                this._surveyResponses = surveyResponses;
                this.questionCompletionDates = [];
                this._armMagnitudes = PersonaArmState.createEmptyArmState();
                this.isUnfinished = false;
                return;
            }
        });
    }

    async init() {
        return await this.initModel;
    }

    @computed
    get questionNum(): number { return this._questionNum; }

    @computed
    get domainNum(): number { return this._domainNum; }

    @computed
    get question(): string { return SurveyQuestions[this._questionNum]; }

    @computed
    get domain(): string { return PersonaDomains[this._domainNum]; }

    get surveyResponses(): any { return this._surveyResponses; }

    get qolArmMagnitudes(): any { return this._armMagnitudes; }

    public nextQuestion(goBack?: boolean): void {
        if (goBack) {
            if (this._questionNum - 1 >= 0) {
                this._questionNum--;
                if ((this._questionNum + 1) % (DOMAIN_QUESTION_COUNT) === 0) {
                    this._domainNum--;
                }
            }
        } else if (this._questionNum + 1 <= QUESTIONS_COUNT - 1) {
            this._questionNum++;
            if ((this._questionNum + 1) % (DOMAIN_QUESTION_COUNT) === 1) {
                this._domainNum++;
            }
        }
    }

    public savePrevResponse(prevResponse: number): void {
        const currDomain: string = this.domain;
        this._surveyResponses[currDomain][this.questionNum % DOMAIN_QUESTION_COUNT] = prevResponse;
        this.saveSurveyProgress(this.qolArmMagnitudes);
    }

    public saveSurveyProgress = async (qolArmMagnitudes: PersonaArmState) => {
        this._armMagnitudes = qolArmMagnitudes;
        let res: boolean;
        if (qolArmMagnitudes === null) {
            res = await AppController.Instance.User.qol.sendPartialQol(null);
            this.isUnfinished = false;
        } else {
            const now = new Date().getTime();
            this.questionCompletionDates = this.questionCompletionDates || [];
            if (this.questionCompletionDates.length - 1 >= this.questionNum) {
                this.questionCompletionDates[this.questionNum] = now;
            } else {
                this.questionCompletionDates.push(now);
            }

            let partialQol: PartialQol = {
                questionNum: this._questionNum + 1, // + 1 is required as this method is called before nextQuestion() which increments the questionNum counter
                domainNum: this._domainNum,
                scores: this._surveyResponses,
                isFirstTimeQol: this.showInterlude,
                startDate: this.startDate,
                questionCompletionDates: this.questionCompletionDates,
            }
            res = await AppController.Instance.User.qol.sendPartialQol(partialQol);
            this.isUnfinished = true;
        }
        return res;
    }

    public sendSurveyResults = async () => {
        let aggregateScore = 0;
        const entries = Object.entries(this._surveyResponses)
        for (const [key, value] of entries) {
            aggregateScore += sum(value);
        }
        aggregateScore /= entries.length
        const res: boolean = await AppController.Instance.User.qol.sendSurveyResults(this._surveyResponses, aggregateScore, this.qolSurveyType, this.startDate, this.questionCompletionDates);
        return res;
    }

    public updateQolOnboarding = () => {
        this._settings.updateQolOnboarding({ seenQolOnboarding: true, lastFullQol: Date() })
        this.showInterlude = true;
    }

    public updatePendingFullQol = () => {
        this._settings.updatePendingFullQol({ pendingFullQol: false });
    }

    private getArmMagnitudes(scores: QolSurveyResults): PersonaArmState {
        let currentArmMagnitudes: PersonaArmState = {};
        for (let domain of PersonaDomains) {
            let score: number = 0;
            scores[domain].forEach((val) => {
                score += val;
            })
            let mag: number;
            if (score === 0) { mag = 0.2; }
            else { mag = 0.4 + (score * 3 / 100); }
            currentArmMagnitudes[domain] = mag;
        }
        return currentArmMagnitudes;
    }

}
