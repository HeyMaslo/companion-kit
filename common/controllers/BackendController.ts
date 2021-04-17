import { IBackendController } from "common/abstractions/controlllers/IBackendController";
import { 
    DomainMagnitudesData,
    QolSurveyResults,
    PartialQol
} from "common/models/QoL";

export default class BackendControllerBase implements IBackendController {

    // private _partialQolState: PartialQol = null;
    private _partialQolState: PartialQol = {questionNum: 3, domainNum: 0, mags: { 
        "physical": 0.8,
        "sleep": 0.2,
        "mood": 0.2,
        "cognition": 0.2,
        "leisure": 0.2,
        "relationships": 0.2,
        "spiritual": 0.2,
        "money": 0.2,
        "home": 0.2,
        "self-esteem": 0.2,
        "independence": 0.2,
        "identity": 0.2,
    }, scores: {
        "physical": 18,
        "sleep": 0,
        "mood": 0,
        "cognition": 0,
        "leisure": 0,
        "relationships": 0,
        "spiritual": 0,
        "money": 0,
        "home": 0,
        "self-esteem": 0,
        "independence": 0,
        "identity": 0,
    }};
    private _SurveyResults: QolSurveyResults[] = [];

    // Fetch the latests survey results (i.e. scores)
    public async getSurveyResults(): Promise<QolSurveyResults> {
        return { 
            "physical": 18,
            "sleep": 20,
            "mood": 20,
            "cognition": 20,
            "leisure": 6,
            "relationships": 20,
            "spiritual": 4,
            "money": 20,
            "home": 20,
            "self-esteem": 8,
            "independence": 20,
            "identity": 20,
        };
    }

    // Submit new survey results
    public async sendSurveyResults(results: QolSurveyResults): Promise<boolean> {
        this._SurveyResults.push(results);
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
        return this._partialQolState;
    }

}