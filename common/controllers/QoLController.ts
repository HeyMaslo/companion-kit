import { IQoLController } from 'common/abstractions/controlllers/IQoLController';
import {
    QolSurveyResults,
    PartialQol,
} from '../../mobile/src/constants/QoL';
import RepoFactory from 'common/controllers/RepoFactory';

export default class QoLControllerBase implements IQoLController {

    private _userId: string = null;

    // Fetch the latests survey results (i.e. scores)
    public async getSurveyResults(): Promise<QolSurveyResults> {
        console.log(`get qol results: userId = ${this._userId}`);
        return await RepoFactory.Instance.surveyResults.getLatestResults(this._userId);
    }

    // Submit new survey results
    public async sendSurveyResults(results: QolSurveyResults, startDate: number, questionCompletionDates: number[]): Promise<boolean> {
        console.log(`add qol results: userId = ${this._userId}`);
        await RepoFactory.Instance.surveyResults.addResults(this._userId, results, startDate, questionCompletionDates);
        return true;
    }

    // Store partial survey state
    // Any subsequent calls to get will return this state
    public async sendPartialQol(qol: PartialQol): Promise<boolean> {

        console.log(`set partial qol: userId = ${this._userId}`);
        if (!this._userId) {
            return false;
        }
        try {
            await RepoFactory.Instance.surveyState.setByUserId(this._userId, qol);
            return true;
        } catch (err) {
            console.log(`sendPartialQol ERROR:  ${err}`);
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
