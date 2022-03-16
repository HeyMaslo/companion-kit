import { QolSurveyResults, QolSurveyType } from '../../../mobile/src/constants/QoL';
import GenericUserRepo from './GenericUserRepo';
import Collections from 'common/database/collections';
import { DomainName, FocusedDomains } from '../../../mobile/src/constants/Domain';

export type SurveyResults = {
    aggregateScore: number,
    date: number,
    focusDomains: FocusedDomains,
    questionCompletionDates: number[],
    results: QolSurveyResults,
    startDate: number,
    surveyType: QolSurveyType,
    strategySlugs: string[],
};

export default class SurveyResultsRepo extends GenericUserRepo<SurveyResults> {

    get collectionName() {
        return Collections.SurveyResults;
    }

    public async getAllResults(userId: string): Promise<SurveyResults[]> {
        return await this.getData(userId);
    }

    public async getLatestResults(userId: string): Promise<QolSurveyResults> {
        const latest = await this._getLatestResults(userId);
        if (latest) {
            return latest.results;
        } else {
            return null;
        }
    }

    public async addResults(userId: string, results: QolSurveyResults, aggregateScore: number, surveyType: QolSurveyType, startDate: number, questionCompletionDates: number[], strategySlugs: string[], focusDomains: FocusedDomains) {
        await this.createUserData(userId, { date: Date.now(), results, aggregateScore, surveyType, startDate, questionCompletionDates, strategySlugs, focusDomains });
    }

    private async _getLatestResults(userId: string): Promise<SurveyResults> {
        const all: SurveyResults[] = await this.getData(userId);
        if (all.length >= 1) {
            // server-side native query aggregation not supported in firestore,
            // so we do it here
            return all.reduce((r1: SurveyResults, r2: SurveyResults) => (r2.date > r1.date ? r2 : r1));
        } else {
            return null;
        }
    }

}