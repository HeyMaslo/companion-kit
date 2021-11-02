import { PartialQol, QolSurveyResults } from '../../../mobile/src/constants/QoL';
import { UserState } from 'common/models/userState';

export interface IQoLController {

    getSurveyResults(): Promise<QolSurveyResults>;

    sendSurveyResults(results: QolSurveyResults, startDate: number, questionCompletionDates: number[]): Promise<boolean>;

    sendPartialQol(qol: PartialQol): Promise<boolean>;

    getPartialQol(): Promise<PartialQol>;

    setUserStateProperty(propertyName: keyof UserState, parameter: UserState[keyof UserState]): Promise<void>

    setUser(userId: string): void;
}