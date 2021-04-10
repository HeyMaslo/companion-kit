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
            'health': 0.9
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