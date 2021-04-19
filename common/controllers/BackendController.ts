import { IBackendController } from "common/abstractions/controlllers/IBackendController";
import { 
    DomainMagnitudesData,
    QolSurveyResults,
    PartialQol
} from "common/models/QoL";
import RepoFactory from 'common/controllers/RepoFactory';

export default class BackendControllerBase implements IBackendController {

    private _userId: string = null;

    // Fetch the latests survey results (i.e. scores)
    public async getSurveyResults(): Promise<QolSurveyResults> {
        return { 
            "physical": 10,
            "sleep": 7,
            "mood": 10,
            "cognition": 7,
            "leisure": 10,
            "relationships": 10,
            "spiritual": 8,
            "money": 8,
            "home": 10,
            "self-esteem": 8,
            "independence": 10,
            "identity": 10,
        };
    }

    // Submit new survey results
    public async sendSurveyResults(results: QolSurveyResults): Promise<boolean> {
        return true;
    }

    // Store partial survey state
	// Any subsequent calls to get will return this state
    public async sendPartialQol(domainMags: DomainMagnitudesData, surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number): Promise<boolean> {
        
        console.log(`set partial qol: userId = ${this._userId}`);
        if (!this._userId) {
            return false;
        } else {
            try {
                await RepoFactory.Instance.surveyState.setByUserId(this._userId,
                    {
                        questionNum: questionNumber,
                        domainNum: domainNumber,
                        mags: null,
                        scores: surveyScores
                    });
                    return true;
            } catch (err) {
                return false;
            }
        }
    }

    // Get last stored state
	// null value indicates no outstanding survey
    public async getPartialQol(): Promise<PartialQol> {
        console.log(`get partial qol: userId = ${this._userId}`);
        return RepoFactory.Instance.surveyState.getByUserId(this._userId);
    }

    public setUser(userId: string) {
        this._userId = userId;
    }

}