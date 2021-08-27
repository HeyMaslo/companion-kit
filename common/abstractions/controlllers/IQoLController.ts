import { PartialQol, QolSurveyResults } from '../../../mobile/src/constants/QoL';

export interface IQoLController {

    getSurveyResults(): Promise<QolSurveyResults>;

    sendSurveyResults(results: QolSurveyResults, startDate: number, questionCompletionDates: number[]): Promise<boolean>;

    sendPartialQol(qol: PartialQol): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

    setUser(userId: string): void;
}