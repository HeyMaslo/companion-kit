import { PartialQol, QolSurveyResults } from 'common/models/QoL';
import { DomainSelection } from 'common/models/userState';

export type Domains = string[];

export interface IQoLController {

    getSurveyResults(): Promise<QolSurveyResults>;

    sendSurveyResults(results: QolSurveyResults): Promise<boolean>;

    sendPartialQol(surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number, isFirstTimeQol: boolean): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

    setDomains(domains: DomainSelection): Promise<void>;

    setUser(userId: string): void;
}
