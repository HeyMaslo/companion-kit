import { IQoLController, Domains } from 'common/abstractions/controlllers/IQoLController';
import {
    QolSurveyResults,
    PartialQol,
    Domain,
    DomainIded,
    Strategy,
    StrategyIded,
} from 'common/models/QoL';
import RepoFactory from 'common/controllers/RepoFactory';
import { Identify } from 'common/models';
import { UserState } from 'common/models/userState';

export default class QoLControllerBase implements IQoLController {

    private _userId: string = null;

    // Fetch the latests survey results (i.e. scores)
    public async getSurveyResults(): Promise<QolSurveyResults> {
        console.log(`get qol results: userId = ${this._userId}`);
        return await RepoFactory.Instance.surveyResults.getLatestResults(this._userId);
    }

    // Submit new survey results
    public async sendSurveyResults(results: QolSurveyResults): Promise<boolean> {
        console.log(`add qol results: userId = ${this._userId}`);
        await RepoFactory.Instance.surveyResults.addResults(this._userId, results);
        return true;
    }

    // Store partial survey state
    // Any subsequent calls to get will return this state
    public async sendPartialQol(surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number, isFirstTimeQol: boolean): Promise<boolean> {

        console.log(`set partial qol: userId = ${this._userId}`);
        if (!this._userId) {
            return false;
        }
        const data = surveyScores == null ? null : {
            questionNum: questionNumber,
            domainNum: domainNumber,
            scores: surveyScores,
            isFirstTimeQol,
        };
        try {
            let st: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
            if (st) {
                st.surveyState = data;
            } else {
                st = {
                    surveyState: data,
                    focusDomains: []
                }
            }
            await RepoFactory.Instance.userState.setByUserId(this._userId, st);
            return true;
        } catch (err) {
            return false;
        }
    }

    public async getPossibleDomains(): Promise<Identify<Domain>[]> {
        return await RepoFactory.Instance.qolDomains.get();
    }

    public async setDomains(domainIds: string[]): Promise<void> {
        console.log("setting focus domains: ", domainIds);
        let st: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
        if (st === null) {
            st = {
                focusDomains: domainIds,
                surveyState: null,
            }
        } else {
            st.focusDomains = domainIds;
        }
        await RepoFactory.Instance.userState.setByUserId(this._userId, st);
    }

    public async getPossibleStrategies(): Promise<Identify<Strategy>[]> {
        return await RepoFactory.Instance.strategies.get();
    }

    public async setStrategies(strategyIds: string[]): Promise<void> {
        let st: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
        if (st === null) {
            st = {
                chosenStrategies: strategyIds,
                surveyState: null
            }
        } else {
            st.focusDomains = strategyIds;
        }
        await RepoFactory.Instance.userState.setByUserId(this._userId, st);
    }

    // Get last stored state
    // null value indicates no outstanding survey
    public async getPartialQol(): Promise<PartialQol> {

        console.log(`get partial qol: userId = ${this._userId}`);
        const state = await RepoFactory.Instance.userState.getByUserId(this._userId);
        let result = null;
        if (state) {
            result = state.surveyState;
        }
        console.log(`get partial qol: result = ${JSON.stringify(result)}`);
        return result;
    }

    public setUser(userId: string) {
        this._userId = userId;
    }

}
