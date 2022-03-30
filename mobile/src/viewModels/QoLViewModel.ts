import { observable, computed } from 'mobx';
import { SurveyQuestions, QUESTIONS_COUNT, DOMAIN_QUESTION_COUNT, ShortSurveyQuestions, SHORT_QUESTIONS_COUNT } from "../constants/QoLSurvey";
import { createLogger } from 'common/logger';
import AppController from 'src/controllers';
import { ILocalSettingsController } from 'src/controllers/LocalSettings';
import { PartialQol, QolSurveyResults, QolSurveyResultsHelper, QolSurveyKeys, QolSurveyType } from 'src/constants/QoL';
import { PersonaArmState } from 'dependencies/persona/lib';
import { sum } from 'src/helpers/DomainHelper';
import Timer from 'tiny-timer'
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

    public readonly domainQuestionCount: number = DOMAIN_QUESTION_COUNT;
    private readonly _settings: ILocalSettingsController = AppController.Instance.User.localSettings;

    constructor() {
        this.initModel = AppController.Instance.User.qol.getPartialQol().then((partialQolState: PartialQol) => {
            if (partialQolState !== null && typeof (partialQolState) !== 'undefined') {
                this._questionNum = partialQolState.questionNum;
                this._domainNum = partialQolState.domainNum;
                this._surveyResponses = partialQolState.scores;
                this.startDate = partialQolState.startDate;
                this.questionCompletionDates = partialQolState.questionCompletionDates;
                this._armMagnitudes = this.getArmMagnitudes(partialQolState.scores);
                this.isUnfinished = true;
                this.showInterlude = this._settings.current.qol.isFirstEverQol;
                this.qolSurveyType = partialQolState.surveyType;
                return;
            } else {
                this.startDate = new Date().getTime();
                this._questionNum = 0;
                this._domainNum = 0;
                this._surveyResponses = QolSurveyResultsHelper.createEmptyResults();;
                this.questionCompletionDates = [];
                this._armMagnitudes = PersonaArmState.createZeroArmState();
                this.isUnfinished = false;
                this.showInterlude = this._settings.current.qol.isFirstEverQol;
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
    get question(): string {
        switch (this.qolSurveyType) {
            case (QolSurveyType.Full):
                return SurveyQuestions[this._questionNum];
            case (QolSurveyType.Short):
                return ShortSurveyQuestions[this._questionNum];
        }
    }

    @computed
    get domain(): string {
        return Object.keys(QolSurveyKeys)[this._domainNum];
    }

    get numQuestions(): number {
        switch (this.qolSurveyType) {
            case (QolSurveyType.Full):
                return QUESTIONS_COUNT;
            case (QolSurveyType.Short):
                return SHORT_QUESTIONS_COUNT;
        }
    }

    get surveyResponses(): any { return this._surveyResponses; }
    private sentResponses: any = null;

    get qolArmMagnitudes(): any { return this._armMagnitudes; }
    set qolArmMagnitudes(newValue: any) { this._armMagnitudes = newValue; }

    set setQolSurveyType(type: QolSurveyType) { this.qolSurveyType = type; }

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

    private submissionTimer: Timer = null;

    private timerFired(self: QOLSurveyViewModel) {
        const responses = this.surveyResponses;
        if (responses !== self.sentResponses) {
            self.sentResponses = responses;
            self.saveSurveyProgress()
        }
    }

    // Call this when exiting the qol survey part way through
    public willExitSurvey() {
        if (this.submissionTimer) {
            this.submissionTimer.stop();
            this.submissionTimer = null;
            this.timerFired(this);
        }
    }

    public async savePrevResponse(prevResponse: number) {
        const currDomain: string = this.domain;
        this._surveyResponses[currDomain][this.questionNum % DOMAIN_QUESTION_COUNT] = prevResponse;
        const now = new Date().getTime();
        this.questionCompletionDates = this.questionCompletionDates || [];
        if (this.questionCompletionDates.length > this.questionNum) {
            this.questionCompletionDates[this.questionNum] = now;
        } else {
            this.questionCompletionDates.push(now);
        }
        this.sentResponses = null;

        if (this.questionNum === (this.numQuestions - 1)) {
            if (this.submissionTimer) {
                this.submissionTimer.stop();
                this.submissionTimer = null;
            }
            await this.saveSurveyProgress();
        } else if (this.submissionTimer == null || this.submissionTimer.status != 'running') {
            this.submissionTimer = new Timer({ interval: 5000 });
            this.submissionTimer.on('tick', () => this.timerFired(this));
            this.submissionTimer.start(60000 * 1000); // max out at 1000 min
        }
    }

    // Update the user's userState with the current (partial) qol survey progress 
    public saveSurveyProgress = async (reset: boolean = false) => {
        let res: boolean;
        if (reset) {
            res = await AppController.Instance.User.qol.sendPartialQol(null);
            this.isUnfinished = false;
        } else {
            let partialQol: PartialQol = {
                questionNum: this._questionNum,
                domainNum: this._domainNum,
                scores: this._surveyResponses,
                startDate: this.startDate,
                questionCompletionDates: this.questionCompletionDates,
                surveyType: this.qolSurveyType,
            }
            res = await AppController.Instance.User.qol.sendPartialQol(partialQol);
            this.isUnfinished = true;
        }
        return res;
    }

    // Calculate the user's aggregateScore and save the survey to firestore/surveyResults
    public sendSurveyResults = async () => {
        let aggregateScore = 0;
        const keys = Object.keys(QolSurveyKeys) //(this._surveyResponses)
        for (const surveyKey of keys) {
            aggregateScore += sum(this._surveyResponses[surveyKey]);
        }
        aggregateScore /= keys.length;
        const res: boolean = await AppController.Instance.User.qol.sendSurveyResults(this._surveyResponses, aggregateScore, this.qolSurveyType, this.startDate, this.questionCompletionDates);
        return res;
    }

    public resolvePendingQol() {
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
        let currentArmMagnitudes: PersonaArmState = PersonaArmState.createZeroArmState();
        for (let domain of Object.keys(QolSurveyKeys)) {
            let score: number = 0;
            scores[domain].forEach((val) => {
                if (val) {
                    score += val;
                }
            })
            let mag: number;
            if (score === 0) { mag = 0.2; }
            else { mag = 0.4 + (score * 3 / 100); }
            currentArmMagnitudes[domain] = mag;
        }
        return currentArmMagnitudes;
    }

    public completeQolOnboarding() {
        this._settings.updateOnboardingSettings({ needsQolOnboarding: false }, 'needsQolOnboarding')
        this._settings.updateQolSettings({ lastFullQol: Date() }, 'lastFullQol');
        this._settings.updateQolSettings({ isFirstEverQol: false }, 'isFirstEverQol');
        this.showInterlude = false;
    }

}
