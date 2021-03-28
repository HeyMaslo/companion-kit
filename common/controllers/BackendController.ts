import { 
    DomainMagnitudesData,
    IBackendController, 
    Domains
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

    public async getDomains(): Promise<Domains> {
        // STUB FUNCTION
        return ["HEALTH", "PHYSICAL"];
    }

    public async setDomain(domain: string): Promise<boolean> {
        // STUB FUNCTION
        const success = true;
        return true;
    }

}