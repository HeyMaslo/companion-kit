import { DomainMagnitudesData, PartialQol, QolSurveyResults } from 'common/models/QoL';

export interface IBackendController {

    getSurveyResults(): Promise<QolSurveyResults>;

    sendSurveyResults(results: QolSurveyResults): Promise<boolean>;

    sendPartialQol(domainMags: DomainMagnitudesData, surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

}