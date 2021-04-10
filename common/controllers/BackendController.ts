import { 
    DomainMagnitudesData,
    QolSurveyResults,
    IBackendController,
    PartialQol
} from "abstractions/controlllers/IBackendController";
import logger from "logger";

export default class BackendControllerBase implements IBackendController {
    private _magsState: DomainMagnitudesData = { 
        "physical": 1,
        "sleep": 0.8,
        "mood": 0.8,
        "cognition": 0.8,
        "leisure": 0.9,
        "relationships": 1,
        "spiritual": 0.8,
        "money": 0.8,
        "home": 1,
        "self-esteem": 0.8,
        "independence": 1,
        "identity": 1,
    };

    private _partialQolState: PartialQol = null;

    public async getDomainMagnitudes(): Promise<DomainMagnitudesData> {
        // STUB FUNCTION
        return this._magsState;
    }

    public async setDomainMagnitudes(magnitudes: DomainMagnitudesData): Promise<boolean> {
        // STUB FUNCTION
        this._magsState = magnitudes;
        const success = true;
        return success;
    }

    public async sendSurveyResults(results: QolSurveyResults): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return success;
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