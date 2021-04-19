import { IBackendController } from "common/abstractions/controlllers/IBackendController";
import { 
    DomainMagnitudesData,
    QolSurveyResults,
    PartialQol
} from "common/models/QoL";

export default class BackendControllerBase implements IBackendController {

    private _userId: string = null;
    private _partialQolState: PartialQol = null;

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
        this._partialQolState = {questionNum: questionNumber, domainNum: domainNumber, mags: domainMags, scores: surveyScores};
        const success = true;
        return success;
    }

    // Get last stored state
	// null value indicates no outstanding survey
    public async getPartialQol(): Promise<PartialQol> {
        console.log(`get partial qol: userId = ${this._userId}`);
        return this._partialQolState;
    }

    public setUser(userId: string) {
        this._userId = userId;
    }

}