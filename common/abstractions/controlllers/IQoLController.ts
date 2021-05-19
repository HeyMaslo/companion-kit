import { PartialQol, QolSurveyResults } from 'common/models/QoL';

export interface IBackendController {

    getSurveyResults(): Promise<QolSurveyResults>;

    sendSurveyResults(results: QolSurveyResults): Promise<boolean>;

    sendPartialQol(surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number, isFirstTimeQol: boolean): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

}