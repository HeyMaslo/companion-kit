import { IBackendController } from "common/abstractions/controlllers/IBackendController";
import { 
    DomainMagnitudesData,
    QolSurveyResults,
    PartialQol
} from "common/models/QoL";

export default class BackendControllerBase implements IBackendController {

    private _partialQolState: PartialQol = null;

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