import { PartialQol, QolSurveyResults } from '../../../mobile/src/constants/QoL';
import GenericUserRepo from './GenericUserRepo';
import Collections from 'common/database/collections';

type SurveyResults = {
    date: number,
    results: QolSurveyResults,
    startDate: number,
    questionCompletionDates: number[],
};

export default class SurveyResultsRepo extends GenericUserRepo<SurveyResults> {

    get collectionName() {
        return Collections.SurveyResults;
    }

    async _getLatestResults(userId: string): Promise<SurveyResults> {
        const all: SurveyResults[] = await this.getData(userId);
        if (all.length >= 1) {
            // server-side native query aggregation not supported in firestore,
            // so we do it here
            return all.reduce((r1: SurveyResults, r2: SurveyResults) => (r2.date > r1.date ? r2 : r1));
        } else {
            return null;
        }
    }

    async getLatestResults(userId: string): Promise<QolSurveyResults> {
        const latest = await this._getLatestResults(userId);
        if (latest) {
            return latest.results;
        } else {
            return null;
        }
    }

    async addResults(userId: string, results: QolSurveyResults, startDate: number, questionCompletionDates: number[]) {
        await this.createUserData(userId, { date: Date.now(), results, startDate, questionCompletionDates });
    }

}