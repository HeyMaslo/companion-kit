import { PartialQol } from '../../../mobile/src/constants/QoL';
import GenericUserRepo from './GenericUserRepo';
import { DocumentSnapshot, Query } from 'common/database/repositories/dbProvider';
import Collections from 'common/database/collections';

export default class SurveyStateRepo extends GenericUserRepo<PartialQol> {

    get collectionName() {
        return Collections.SurveyState;
    }

    async getByUserId(userId: string): Promise<PartialQol> {
        const docs: PartialQol[] = await this.getData(userId);
        if (docs.length < 1) {
            return null;
        } else {
            return docs[0];
        }
    }

    async setByUserId(userId: string, state: PartialQol) {
        const docs = await this.getDocs(userId);
        const data = { userId, data: state };
        if (docs.length < 1) {
            await this.create(data);
        } else if (docs.length === 1) {
            await docs[0].ref.set(data);
        } else {
            throw new Error('assertion failed: should not have more than on state per user');
        }
    }

}