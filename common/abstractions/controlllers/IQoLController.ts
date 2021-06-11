import { PartialQol, QolSurveyResults } from '../../../mobile/src/constants/QoL';

export type Domains = string[];

export interface IQoLController {

    getSurveyResults(): Promise<QolSurveyResults>;

    sendSurveyResults(results: QolSurveyResults, startDate: number, questionCompletionDates: number[]): Promise<boolean>;

    sendPartialQol(qol: PartialQol): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

    setDomains(domainIds: string[]): Promise<void>;

    setUser(userId: string): void;
}