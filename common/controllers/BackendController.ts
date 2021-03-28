import { 
    DomainMagnitudesData,
    IBackendController 
} from "abstractions/controlllers/IBackendController";

export default class BackendControllerBase implements IBackendController {

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
            "self-esteem": 1,
            "independence": 0.7,
            "identity": 1,
        }
    }

    public async setDomainMagnitudes(magnitudes: any): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return true;
    }

}