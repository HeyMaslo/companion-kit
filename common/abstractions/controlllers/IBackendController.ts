import { DomainMagnitudesData, PartialQol, QolSurveyResults } from "common/models/QoL";

export interface IBackendController {

    getDomainMagnitudes(): Promise<DomainMagnitudesData>;

    setDomainMagnitudes(magnitudes: DomainMagnitudesData): Promise<boolean>;

    sendSurveyResults(results: QolSurveyResults): Promise<boolean>;

    sendPartialQol(domainMags: DomainMagnitudesData, surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

}