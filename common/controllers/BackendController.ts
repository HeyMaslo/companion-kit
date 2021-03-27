import { 
    DomainMagnitudesData,
    IBackendController 
} from "abstractions/controlllers/IBackendController";

export default class BackendControllerBase implements IBackendController {

    public async getDomainMagnitudes(): Promise<DomainMagnitudesData> {
        // STUB FUNCTION
        return { 
            "physical": 0,
            "sleep": 0,
            "mood": 0,
            "cognition": 0,
            "leisure": 0,
            "relationships": 0,
            "spiritual": 0,
            "money": 0,
            "home": 0,
            "selfEsteem": 0,
            "independence": 0,
            "identity": 0,
        }
    }

    public async setDomainMagnitudes(magnitudes: any): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return true;
    }

}