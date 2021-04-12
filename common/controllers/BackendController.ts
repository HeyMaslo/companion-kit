import { 
    DomainMagnitudesData,
    QolSurveyResults,
    IBackendController,
    PartialQol
} from "abstractions/controlllers/IBackendController";

export default class BackendControllerBase implements IBackendController {
    private _magsState: DomainMagnitudesData = { 
        "physical": 0.2,
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
    };

    //private _partialQolState: PartialQol = {questionNum: 1, domainNum: 1, mags: this._magsState, scores: null};
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
            let success;
            if (domainMags === null) {
                this._partialQolState = null;
                success = true;
            } else {
                this._partialQolState = {questionNum: questionNumber, domainNum: domainNumber, mags: domainMags, scores: surveyScores};
                success = true;
            }
        return success;
    }

    public async getPartialQol(): Promise<PartialQol> {
        return this._partialQolState;
    }

}