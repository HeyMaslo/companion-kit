import { IQoLController } from 'common/abstractions/controlllers/IQoLController';
import {
    QolSurveyResults,
    PartialQol,
    QolSurveyType,
    DailyCheckInScore,
} from '../../mobile/src/constants/QoL';
import RepoFactory from 'common/controllers/RepoFactory';
import { UserState, LastSeen } from 'common/models/userState';
import { createLogger } from 'common/logger';
import { SurveyResults } from 'database/repositories/SurveyResultsRepo';
import { FocusedDomains } from '../../mobile/src/constants/Domain';

const logger = createLogger('[QoLController]');

export default class QoLControllerBase implements IQoLController {

    private _userId: string = null;

    public async getUserState(): Promise<UserState> {
        return await RepoFactory.Instance.userState.getByUserId(this._userId);
    }

    // Fetch the user's latest survey results (i.e. scores)
    public async getSurveyResults(): Promise<QolSurveyResults> {
        logger.log(`get qol results: userId = ${this._userId}`);
        return await RepoFactory.Instance.surveyResults.getLatestResults(this._userId);
    }
    // Fetch the user's entire history of survey results
    public async getAllSurveyResults(): Promise<SurveyResults[]> {
        logger.log(`get ALL qol results: userId = ${this._userId}`);
        return await RepoFactory.Instance.surveyResults.getAllResults(this._userId);
    }

    // Submit new survey results (after survey is finished)
    public async sendSurveyResults(results: QolSurveyResults, aggregateScore: number, surveyType: QolSurveyType, startDate: number, questionCompletionDates: number[]): Promise<boolean> {
        logger.log(`add qol results: userId = ${this._userId}`);
        let userState: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
        await RepoFactory.Instance.surveyResults.addResults(this._userId, results, aggregateScore, surveyType, startDate, questionCompletionDates, userState.chosenStrategies, userState.focusedDomains);
        return true;
    }

    // Send state of survey while it is in progress (partialy finsished)
    public async sendPartialQol(qol: PartialQol): Promise<boolean> {

        logger.log(`set partial qol: userId = ${this._userId}`);
        if (!this._userId) {
            return false;
        }
        try {
            let st: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
            if (st) {
                st.surveyState = qol;
            } else {
                // This is the inital setup of the user's UserState and it is set after the first question of the onboarding qol survey
                st = {
                    surveyState: qol,
                    focusedDomains: { domains: [], subdomains: [] },
                    chosenStrategies: [],
                    lastSeenAffirmations: {},
                    scheduledAffirmations: [],
                    favoriteResources: [],
                    hiddenResources: [],
                }
            }
            await RepoFactory.Instance.userState.setByUserId(this._userId, st);
            return true;
        } catch (err) {
            logger.log(`sendPartialQol ERROR:  ${err}`);
            return false;
        }
    }

    // Get last stored state
    // null value indicates no outstanding survey
    public async getPartialQol(): Promise<PartialQol> {

        logger.log(`get partial qol: userId = ${this._userId}`);
        const state = await RepoFactory.Instance.userState.getByUserId(this._userId);
        let result = null;
        if (state) {
            result = state.surveyState;
        }
        logger.log(`get partial qol: result = ${JSON.stringify(result)}`);
        return result;
    }

    public setUser(userId: string) {
        this._userId = userId;
    }

    public async setUserStateProperty(propertyName: keyof UserState, parameter: UserState[keyof UserState] | FocusedDomains): Promise<void> {
        let userState: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
        if (userState === null) {
            userState = {
                surveyState: null,
                focusedDomains: { domains: [], subdomains: [] },
                chosenStrategies: [],
                lastSeenAffirmations: {},
                scheduledAffirmations: [],
                favoriteResources: [],
                hiddenResources: [],
            }
        } else if (propertyName == 'focusedDomains') {
            userState['focusedDomains'] = (parameter as FocusedDomains)
        } else if (propertyName == 'chosenStrategies') {
            userState['chosenStrategies'] = parameter as string[];
        } else if (propertyName == 'lastSeenAffirmations' && (parameter as LastSeen) !== undefined) {
            userState[propertyName] = (parameter as LastSeen);
        } else if (propertyName == 'favoriteResources') {
            userState[propertyName] = parameter as string[];
        } else if (propertyName == 'hiddenResources') {
            userState[propertyName] = parameter as string[];
        }
        await RepoFactory.Instance.userState.setByUserId(this._userId, userState);
    }

    // Submit new Daily Check In
    public async sendDailyCheckIn(checkInScore: DailyCheckInScore): Promise<boolean> {
        await RepoFactory.Instance.dailyCheckIns.addCheckIn(this._userId, checkInScore);
        return true;
    }

}
