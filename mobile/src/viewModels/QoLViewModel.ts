import { observable, computed, toJS } from 'mobx';
import { SurveyQuestions, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT, ShortSurveyQuestions, SHORT_QUESTIONS_COUNT } from "../constants/QoLSurvey";
import { PersonaDomains } from '../stateMachine/persona';
import { createLogger } from 'common/logger';
import AppController from 'src/controllers';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import { PartialQol, QolSurveyResults, QolSurveyType } from 'src/constants/QoL';
import { PersonaArmState } from 'dependencies/persona/lib';

export const logger = createLogger('[QOLModel]');

export default class QOLSurveyViewModel {

    @observable
    private _questionNum: number;
    @observable
    private _domainNum: number;
    private _surveyResponses: QolSurveyResults;
    private _armMagnitudes: PersonaArmState;
    public isUnfinished: boolean;
    public initModel: Promise<void>;
    public originalArmMagnitudes: PersonaArmState;
    public showInterlude: boolean = false;
    public qolSurveyType: QolSurveyType;
    public startDate: number;
    public questionCompletionDates: number[];

    public readonly domainQuestionCount: number = DOMAIN_QUESTION_COUNT;
    private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;
    

    constructor() {
        this.initModel = AppController.Instance.User.qol.getPartialQol().then((partialQolState: PartialQol) => {
            if (partialQolState !== null) {
                this._questionNum = partialQolState.questionNum;
                this._domainNum = partialQolState.domainNum;
                this._surveyResponses = partialQolState.scores;
                this.startDate = partialQolState.startDate;
                this.questionCompletionDates = partialQolState.questionCompletionDates;
                this._armMagnitudes = this.getArmMagnitudes(partialQolState.scores);
                this.isUnfinished = true;
                this.showInterlude = partialQolState.isFirstTimeQol;
                this.qolSurveyType = partialQolState.surveyType;
                return;
            } else {
                this.startDate = new Date().getTime();
                this._questionNum = 0;
                this._domainNum = 0;
                const surveyResponses = {};
                for (let domain of PersonaDomains) {
                    surveyResponses[domain] = 0;
                }
                this._surveyResponses = surveyResponses;
                this.questionCompletionDates = [];
                this._armMagnitudes = PersonaArmState.createEmptyArmState();
                this.isUnfinished = false;
                this.qolSurveyType = QolSurveyType.Full;
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
    get question(): string { return this.qolSurveyType == QolSurveyType.Full ? SurveyQuestions[this._questionNum] : ShortSurveyQuestions[this._questionNum]; }

    @computed
    get domain(): string { return PersonaDomains[this._domainNum]; }

    get numQuestions(): number { return this.qolSurveyType == QolSurveyType.Short ? SHORT_QUESTIONS_COUNT: QUESTIONS_COUNT; }

    get surveyResponses(): any { return this._surveyResponses; }

    get qolArmMagnitudes(): any { return this._armMagnitudes; }

    set setQolSurveyType(type: QolSurveyType) { this.qolSurveyType = type; }

    resetSurveyResults(): void {
        const surveyResponses = {};

        for (let domain of PersonaDomains) {
            surveyResponses[domain] = 0;
        }

        this._surveyResponses = surveyResponses;
    }

    public nextQuestion(): void {
        if (!((this._questionNum + 1) > (this.numQuestions - 1))) {
            this._questionNum++;
            if ((this._questionNum + 1) % (DOMAIN_QUESTION_COUNT) === 1) {
                this._domainNum++;
            }
        }
    }

    public savePrevResponse(prevResponse: number): void {
        const currDomain: string = this.domain;
        this._surveyResponses[currDomain] += prevResponse;
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
                surveyType: this.qolSurveyType,
            }
            res = await AppController.Instance.User.qol.sendPartialQol(partialQol);
            this.isUnfinished = true;
        }
        return res;
    }

    public sendSurveyResults = async () => {
        const res: boolean = await AppController.Instance.User.qol.sendSurveyResults(this._surveyResponses, this.startDate, this.questionCompletionDates);
        return res;
    }

    public updateQolOnboarding() {
        this._settings.updateQolSettings({ seenQolOnboarding: true }, 'seenQolOnboarding');
        this._settings.updateQolSettings({ lastFullQol: Date() }, 'lastFullQol');
        this.showInterlude = true;
    }

    public updatePendingQol() {
        switch (this.qolSurveyType) {
            case QolSurveyType.Full:
                this._settings.updateQolSettings({ pendingFullQol: false }, 'pendingFullQol');
                break;
            case QolSurveyType.Short:
                this._settings.updateQolSettings({ pendingShortQol: false }, 'pendingShortQol');
                break;
        }

    }

    private getArmMagnitudes(scores: QolSurveyResults): PersonaArmState {
        let currentArmMagnitudes: PersonaArmState = {};
        for (let domain of PersonaDomains) {
            let score: number = scores[domain];
            let mag: number;
            if (score === 0) { mag = 0.2; }
            else { mag = 0.4 + (score * 3 / 100); }
            currentArmMagnitudes[domain] = mag;
        }
        return currentArmMagnitudes;
    }

}
