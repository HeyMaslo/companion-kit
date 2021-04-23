import { observable, computed, toJS } from 'mobx';
import { SurveyQuestions, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT } from "../constants/QoLSurvey";
import { PersonaDomains } from '../stateMachine/persona';
import { createLogger } from 'common/logger';
import AppController from 'src/controllers';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import { PartialQol } from 'common/models/QoL';
import { PersonaArmState } from 'dependencies/persona/lib';

export const logger = createLogger('[QOLModel]');

export enum QolType {
    Onboarding = "ONBOARDING",
    Monthly = "MONTHLY",
}

export default class QOLSurveyViewModel {

    // VIEW MODEL STATE:
    @observable
    private _questionNum: number;
    @observable
    private _domainNum: number;
    private _surveyResponses: any;
    private _armMags: PersonaArmState;
    public isUnfinished: boolean;
    public initModel: Promise<void>;
    public origMags: PersonaArmState;
    public showInterlude: boolean = false;
    public qolType: QolType;

    public readonly numQuestions: number = QUESTIONS_COUNT;
    public readonly domainQuestions: number = DOMAIN_QUESTION_COUNT;
    private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;

    // public domainCount: number = DOMAIN_COUNT;


    constructor() {
        this.initModel = AppController.Instance.Backend.getPartialQol().then((partialQolState: PartialQol) => {
            if (partialQolState !== null) {
                this._questionNum = partialQolState.questionNum;
                this._domainNum = partialQolState.domainNum;
                this._surveyResponses = partialQolState.scores;
                this._armMags = partialQolState.mags;
                this.isUnfinished = true;
                this.showInterlude = partialQolState.isFirstTimeQol;
                return;
            } else {
                this._questionNum = 0;
                this._domainNum = 0;
                const surveyResponses = {};
                for (let domain of PersonaDomains) {
                    surveyResponses[domain] = 0;
                }
                this._surveyResponses = surveyResponses;
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

    set setQolType(type: QolType) { this.qolType = type; }

    resetSurveyResults(): void {
        const surveyResponses = {};

        for (let domain of PersonaDomains) {
            surveyResponses[domain] = 0;
        }
        
        this._surveyResponses = surveyResponses;
    }

    // @computed

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
    }

    public saveSurveyProgress = async (qolMags: PersonaArmState) => {
        this._armMags = qolMags;
        let res: boolean;
        if (qolMags === null) {
            res = await AppController.Instance.Backend.sendPartialQol(null, null, null, null, null);
            this.isUnfinished = false;

        } else {
            res = await AppController.Instance.Backend.sendPartialQol(qolMags, this._surveyResponses, this._questionNum, this._domainNum, this.showInterlude);
            this.isUnfinished = true;
        }
        return res;
    }

    public sendSurveyResults = async () => {
        const res: boolean = await AppController.Instance.Backend.sendSurveyResults(this._surveyResponses);
        return res;
    }

    public updateQolOnboarding = () => {
        this._settings.updateQolOnboarding({ seenOnboardingQol: true, lastMonthlyQol: Date() })
        this.showInterlude = true;
    }
}

