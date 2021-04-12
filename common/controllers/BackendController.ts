import { IBackendController } from "common/abstractions/controlllers/IBackendController";
import { 
    DomainMagnitudesData,
    QolSurveyResults,
    PartialQol
} from "common/models/QoL";

export default class BackendControllerBase implements IBackendController {

    private _partialQolState: PartialQol = null;

    public async getDomainMagnitudes(): Promise<DomainMagnitudesData> {
        // STUB FUNCTION
        return { 
            "physical": 1,
            "sleep": 0.7,
            "mood": 1,
            "cognition": 0.7,
            "leisure": 1,
            "relationships": 1,
            "spiritual": 0.8,
            "money": 0.8,
            "home": 1,
            "self-esteem": 0.8,
            "independence": 1,
            "identity": 1,
        }
    }

    public async setDomainMagnitudes(magnitudes: DomainMagnitudesData): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return true;
    }

    // Submit survey results to the server
    public async sendSurveyResults(results: QolSurveyResults): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return true;
    }

    // Store partial survey state 
    public async sendPartialQol(domainMags: DomainMagnitudesData, surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number): Promise<boolean> {
        this._partialQolState = {questionNum: questionNumber, domainNum: domainNumber, mags: domainMags, scores: surveyScores};
        const success = true;
        return success;
    }

    // Restore last stored state
    public async getPartialQol(): Promise<PartialQol> {
        return this._partialQolState;
    }

}