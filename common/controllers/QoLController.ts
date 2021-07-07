import { IQoLController } from 'common/abstractions/controlllers/IQoLController';
import {
    QolSurveyResults,
    PartialQol,
} from '../../mobile/src/constants/QoL';
import RepoFactory from 'common/controllers/RepoFactory';
import { UserState } from 'common/models/userState';
import { createLogger } from 'common/logger';

const logger = createLogger('[QoLController]');

export default class QoLControllerBase implements IQoLController {

    private _userId: string = null;

    // Fetch the latests survey results (i.e. scores)
    public async getSurveyResults(): Promise<QolSurveyResults> {
        logger.log(`get qol results: userId = ${this._userId}`);
        return await RepoFactory.Instance.surveyResults.getLatestResults(this._userId);
    }

    // Submit new survey results
    public async sendSurveyResults(results: QolSurveyResults, startDate: number, questionCompletionDates: number[]): Promise<boolean> {
        logger.log(`add qol results: userId = ${this._userId}`);
        await RepoFactory.Instance.surveyResults.addResults(this._userId, results, startDate, questionCompletionDates);
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
                    focusDomains: []
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
        let st: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
        if (st === null) {
            st = {
                [propertyName]: parameter,
                surveyState: null
            }
        } else if (propertyName !== 'surveyState' && Array.isArray(parameter)){
            st[propertyName] = parameter;
        }
        await RepoFactory.Instance.userState.setByUserId(this._userId, st);
    }

}
