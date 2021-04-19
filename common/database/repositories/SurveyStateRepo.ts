import { PartialQol, SurveyState } from 'common/models/QoL';
import { GenericRepo } from 'common/database/repositories';
import { DocumentSnapshot, Query } from 'common/database/repositories/dbProvider';

export default class SurveyStateRepo extends GenericRepo<SurveyState> {

    query(userId: string): Query {
        return this.collection
        .where(nameof<SurveyState>(d => d.userId), '==', userId);
    }

    async getByUserId(userId: string): Promise<PartialQol> {
        const docs: DocumentSnapshot[] = (await this.query(userId).get()).docs;
        if (docs.length < 1) {
            return null;
        } else {
            return (docs[0].data() as SurveyState).state;
        }
    }

    async setByUserId(userId: string, state: PartialQol) {
        // TODO: should probably be optimized
        const docs = (await this.query(userId).get()).docs;
        if (docs.length < 1) {
            this.create({ userId, state });
        } else if (docs.length > 1) {
            throw new Error('assertion failed: should not have more than on state per user');
        }
    }

}