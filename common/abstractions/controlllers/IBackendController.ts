export type DomainMagnitudesData = {
    [dom: string]: number
};

export type QolSurveyResults = {
    [dom: string]: number
};

export interface IBackendController {

    getDomainMagnitudes(): Promise<DomainMagnitudesData>;

    setDomainMagnitudes(magnitudes: DomainMagnitudesData): Promise<boolean>;

    sendSurveyResults(results: QolSurveyResults): Promise<boolean>
}