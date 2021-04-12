import { 
    DomainMagnitudesData,
    IBackendController 
} from "abstractions/controlllers/IBackendController";

export default class BackendControllerBase implements IBackendController {

    public async getDomainMagnitudes(): Promise<DomainMagnitudesData> {
        // STUB FUNCTION
        return {
            'health': 0.9
        }
    }

    public async setDomainMagnitudes(magnitudes: any): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return true;
    }

}