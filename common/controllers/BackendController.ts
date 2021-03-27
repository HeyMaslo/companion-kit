import { 
    DomainMagnitudesData,
    QolSurveyResults,
    IBackendController,
    PartialQol
} from "abstractions/controlllers/IBackendController";

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
            "spiritual": 1,
            "money": 0.7,
            "home": 1,
            "selfEsteem": 1,
            "independence": 0.7,
            "identity": 1,
        }
    }

    public async setDomainMagnitudes(magnitudes: DomainMagnitudesData): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return true;
    }

    public async sendSurveyResults(results: QolSurveyResults): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return true;
    }

    public async sendPartialQol(domainMags: DomainMagnitudesData, surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number): Promise<boolean> {
        this._partialQolState = {questionNum: questionNumber, domainNum: domainNumber, mags: domainMags, scores: surveyScores};
        const success = true;
        return success;
    }

    public async getPartialQol(): Promise<PartialQol> {
        return this._partialQolState;
    }

}