export type DomainMagnitudesData = {
    [dom: string]: number
};

export type Domains = string[];

export interface IBackendController {

    getDomainMagnitudes(): Promise<DomainMagnitudesData>;

    setDomainMagnitudes(magnitudes: any): Promise<boolean>;

    setDomain(domain: string): Promise<boolean>;

    getDomains(): Promise<Domains>;
}