import { 
    DomainMagnitudesData,
    QolSurveyResults,
    IBackendController 
} from "abstractions/controlllers/IBackendController";

export default class BackendControllerBase implements IBackendController {

    public async getDomainMagnitudes(): Promise<DomainMagnitudesData> {
        // STUB FUNCTION
        return { 
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

}