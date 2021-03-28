import { reaction, transaction, observable, computed, toJS } from 'mobx';
import { SurveyQuestions, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT } from "../constants/QoLSurvey";
import { PersonaDomains } from '../stateMachine/persona';
import { createLogger } from 'common/logger';
import AppViewModel from '.';

export const logger = createLogger('[QOLModel]');

export default class QOLSurveyViewModel {

    @observable
    private _questionNum: number;

    @observable
    private _domainNum: number;

    private _surveyResponses: any;

    public numQuestions: number = QUESTIONS_COUNT;

    public domainQuestions: number = DOMAIN_QUESTION_COUNT;

    constructor() {
        this._questionNum = 0;
        this._domainNum = 0;
        this.resetSurveyResults();
    }

    @computed
    get getQuestionNum(): number { return this._questionNum; }

    @computed
    get getDomainNum(): number { return this._domainNum; }

    @computed
    get getQuestion(): string { return SurveyQuestions[this._questionNum]; }

    @computed
    get getDomain(): string { return PersonaDomains[this._domainNum]; }

    get getSurveyResponses(): any { return this._surveyResponses; }

    resetSurveyResults(): void {
        const surveyResponses = {};

        for (let domain of PersonaDomains) {
            surveyResponses[domain] = 0;
        }
        
        this._surveyResponses = surveyResponses;
    }

    finishSurvey(): void {
        logger.log("QoL Survey Results:", this._surveyResponses);
        this.resetSurveyResults();
        AppViewModel.Instance.QOL = new QOLSurveyViewModel();
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
        const domainResponseIndex: number = this.getQuestionNum % DOMAIN_QUESTION_COUNT;
        const domainResponseArray: number[] = this._surveyResponses[currDomain];
        domainResponseArray[domainResponseIndex] = prevResponse;
    }
}

