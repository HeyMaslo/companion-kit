import { observable, computed, toJS } from 'mobx';
import { SurveyQuestions, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT } from "../constants/QoLSurvey";
import { PersonaDomains } from '../stateMachine/persona';
import { createLogger } from 'common/logger';
import AppController from 'src/controllers';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import { PartialQol } from 'common/models/QoL';
import { PersonaArmState } from 'dependencies/persona/lib';

export const logger = createLogger('[QOLModel]');

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

    public readonly numQuestions: number = QUESTIONS_COUNT;
    public readonly domainQuestions: number = DOMAIN_QUESTION_COUNT;
    private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;

    constructor() {
        this.initModel = AppController.Instance.Backend.getPartialQol().then((partialQolState: PartialQol) => {
            if (partialQolState !== null) {
                this._questionNum = partialQolState.questionNum;
                this._domainNum = partialQolState.domainNum;
                this._surveyResponses = partialQolState.scores;
                this._armMags = partialQolState.mags;
                this.isUnfinished = true;
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
    
    // TODO: rename getters with proper convention
    @computed
    get getQuestionNum(): number { return this._questionNum; }

    @computed
    get getDomainNum(): number { return this._domainNum; }

    @computed
    get getQuestion(): string { return SurveyQuestions[this._questionNum]; }

    @computed
    get getDomain(): string { return PersonaDomains[this._domainNum]; }

    get getSurveyResponses(): any { return this._surveyResponses; }

    get getQolMags(): any { return this._armMags; }

    resetSurveyResults(): void {
        const surveyResponses = {};

        for (let domain of PersonaDomains) {
            surveyResponses[domain] = 0;
        }
        
        this._surveyResponses = surveyResponses;
    }

    public nextQuestion(): void {
        if (!((this._questionNum + 1) > (QUESTIONS_COUNT - 1))) {
            this._questionNum++;
            if ((this._questionNum + 1) % (DOMAIN_QUESTION_COUNT) === 1) {
                this._domainNum++;
            }
        }
    }

    public savePrevResponse(prevResponse: number): void {
        const currDomain: string = this.getDomain;
        this._surveyResponses[currDomain] += prevResponse;
    }

    public saveSurveyProgress = async (qolMags: PersonaArmState) => {
        this._armMags = qolMags;
        let res;
        if (qolMags === null) {
            res = await AppController.Instance.Backend.sendPartialQol(null, null, null, null);
            this.isUnfinished = false;

        } else {
            res = await AppController.Instance.Backend.sendPartialQol(qolMags, this._surveyResponses, this._questionNum, this._domainNum);
            this.isUnfinished = true;
        }
        return res;
    }

    public sendSurveyResults = async () => {
        const res = AppController.Instance.Backend.sendSurveyResults(this._surveyResponses);
        return res;
    }

    public updateQolOnboarding = () => {
        this._settings.updateQolOnboarding({ seenOnboardingQol: true })
    }
}

