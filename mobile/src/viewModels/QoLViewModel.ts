import { observable, computed, toJS } from 'mobx';
import { SurveyQuestions, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT } from "../constants/QoLSurvey";
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
    private _armMags: PersonaArmState;
    public isUnfinished: boolean;
    public initModel: Promise<void>;
    public origMags: PersonaArmState;
    public showInterlude: boolean = false;
    public QolSurveyType: QolSurveyType;
    public startDate: number;
    public questionCompletionDates: number[];

    public readonly numQuestions: number = QUESTIONS_COUNT;
    public readonly domainQuestionCount: number = DOMAIN_QUESTION_COUNT;
    private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;
    

    constructor() {
        this.initModel = AppController.Instance.User.backend.getPartialQol().then((partialQolState: PartialQol) => {
            if (partialQolState !== null) {
                this._questionNum = partialQolState.questionNum;
                this._domainNum = partialQolState.domainNum;
                this._surveyResponses = partialQolState.scores;
                this.startDate = partialQolState.startDate;
                this.questionCompletionDates = partialQolState.questionCompletionDates;
                this._armMags = this.getMags(partialQolState.scores);
                this.isUnfinished = true;
                this.showInterlude = partialQolState.isFirstTimeQol;
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
                this._armMags = PersonaArmState.createEmptyArmState();
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

    get qolMags(): any { return this._armMags; }

    set setQolSurveyType(type: QolSurveyType) { this.QolSurveyType = type; }

    public nextQuestion(): void {
        if (!((this._questionNum + 1) > (QUESTIONS_COUNT - 1))) {
            this._questionNum++;
            if ((this._questionNum + 1) % (DOMAIN_QUESTION_COUNT) === 1) {
                this._domainNum++;
            }
        }
    }

    public savePrevResponse(prevResponse: number): void {
        const currDomain: string = this.domain;
        this._surveyResponses[currDomain] += prevResponse;
        this.saveSurveyProgress(this.qolMags);
    }

    public saveSurveyProgress = async (qolMags: PersonaArmState) => {
        this._armMags = qolMags;
        let res: boolean;
        if (qolMags === null) {
            res = await AppController.Instance.User.backend.sendPartialQol(null);
            this.isUnfinished = false;

        } else {
            const now = new Date().getTime();
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
            res = await AppController.Instance.User.backend.sendPartialQol(partialQol);
            this.isUnfinished = true;
        }
        return res;
    }

    public sendSurveyResults = async () => {
        const res: boolean = await AppController.Instance.User.backend.sendSurveyResults(this._surveyResponses, this.startDate, this.questionCompletionDates);
        return res;
    }

    public updateQolOnboarding = () => {
        this._settings.updateQolOnboarding({ seenOnboardingQol: true, lastFullQol: Date() })
        this.showInterlude = true;
    }

    public updatePendingFullQol = () => {
        this._settings.updatePendingFullQol({ pendingFullQol: false });
    }

    private getMags(scores: QolSurveyResults): PersonaArmState {
        let currMags: PersonaArmState = {};
        for (let domain of PersonaDomains) {
            let score: number = scores[domain];
            let mag: number;
            if (score === 0) { mag = 0.2; }
            else { mag = 0.4 + (score * 3 / 100); }
            currMags[domain] = mag;
        }
        return currMags;
    }
    
}
