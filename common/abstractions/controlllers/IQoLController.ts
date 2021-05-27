import { PartialQol, QolSurveyResults } from 'common/models/QoL';

export type Domains = string[];

export interface IQoLController {

    getSurveyResults(): Promise<QolSurveyResults>;

    sendSurveyResults(results: QolSurveyResults): Promise<boolean>;

    sendPartialQol(surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number, isFirstTimeQol: boolean): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

    setDomains(domainIds: string[]): Promise<void>;

    setUser(userId: string): void;
}
