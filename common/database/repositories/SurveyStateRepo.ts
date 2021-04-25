import { PartialQol, SurveyState } from 'common/models/QoL';
import { GenericRepo } from 'common/database/repositories';
import { DocumentSnapshot, Query } from 'common/database/repositories/dbProvider';
import Collections from 'common/database/collections';

export default class SurveyStateRepo extends GenericRepo<SurveyState> {

    get collectionName() {
        return Collections.SurveyState;
    }

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
        const docs = (await this.query(userId).get()).docs;
        const data = { userId, state };
        if (docs.length < 1) {
            await this.create(data);
        } else if (docs.length == 1) {
            await docs[0].ref.set(data);
        } else {
            throw new Error('assertion failed: should not have more than on state per user');
        }
    }

}