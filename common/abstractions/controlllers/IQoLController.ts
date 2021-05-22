import { PartialQol, QolSurveyResults } from 'common/models/QoL';

export interface IQoLController {

    getSurveyResults(): Promise<QolSurveyResults>;

    sendSurveyResults(results: QolSurveyResults): Promise<boolean>;

    sendPartialQol(surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number, isFirstTimeQol: boolean): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

    setUser(userId: string): void;
}
