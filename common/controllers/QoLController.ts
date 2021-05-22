import { IBackendController } from 'common/abstractions/controlllers/IQoLController';
import {
    QolSurveyResults,
    PartialQol,
} from 'common/models/QoL';
import RepoFactory from 'common/controllers/RepoFactory';

export default class BackendControllerBase implements IBackendController {

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
            await RepoFactory.Instance.surveyState.setByUserId(this._userId, data);
            return true;
        } catch (err) {
            return false;
        }
    }

    // Get last stored state
    // null value indicates no outstanding survey
    public async getPartialQol(): Promise<PartialQol> {

        console.log(`get partial qol: userId = ${this._userId}`);
        const result = await RepoFactory.Instance.surveyState.getByUserId(this._userId);
        console.log(`get partial qol: result = ${JSON.stringify(result)}`);
        return result;
    }

    public setUser(userId: string) {
        this._userId = userId;
    }

}
