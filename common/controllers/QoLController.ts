import { IQoLController } from 'common/abstractions/controlllers/IQoLController';
import {
    QolSurveyResults,
    PartialQol,
    QolSurveyType,
} from '../../mobile/src/constants/QoL';
import RepoFactory from 'common/controllers/RepoFactory';
import { UserState, LastSeen } from 'common/models/userState';
import { createLogger } from 'common/logger';
import { SurveyResults } from 'database/repositories/SurveyResultsRepo';
import { DomainName } from '../../mobile/src/constants/Domain';

const logger = createLogger('[QoLController]');

export default class QoLControllerBase implements IQoLController {

    private _userId: string = null;

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

    // Submit new survey results
    public async sendSurveyResults(results: QolSurveyResults, aggregateScore: number, surveyType: QolSurveyType, startDate: number, questionCompletionDates: number[]): Promise<boolean> {
        logger.log(`add qol results: userId = ${this._userId}`);
        let userState: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
        await RepoFactory.Instance.surveyResults.addResults(this._userId, results, aggregateScore, surveyType, startDate, questionCompletionDates, userState.chosenStrategies, userState.focusedDomains);
        return true;
    }

    // Store partial survey state
    // Any subsequent calls to get will return this state
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
                st = {
                    surveyState: qol,
                    focusedDomains: [],
                    chosenStrategies: [],
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

    public async setUserStateProperty(propertyName: keyof UserState, parameter: UserState[keyof UserState]): Promise<void> {
        let userState: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
        if (userState === null) {
            userState = {
                surveyState: null,
                focusedDomains: [],
                chosenStrategies: [],
                lastSeenAffirmations: {},
                scheduledAffirmations: [],
            }
        } else if (propertyName == 'focusedDomains') {
            userState['focusedDomains'] = parameter as DomainName[];
        } else if (propertyName == 'chosenStrategies') {
            userState['chosenStrategies'] = parameter as string[];
        }
        //  else if (propertyName == 'lastSeenAffirmations' && (parameter as LastSeen) !== undefined) {
        //     userState[propertyName] = (parameter as LastSeen);
        // }
        await RepoFactory.Instance.userState.setByUserId(this._userId, userState);
    }

}
