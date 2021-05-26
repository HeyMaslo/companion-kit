import { GenericUserRepo } from 'common/database/repositories';
import { UserState } from 'common/models/userState';
import Collections from 'common/database/collections';

export default class DomainRepo extends GenericUserRepo<UserState> {

    get collectionName() {
        return Collections.UserState;
    }

    async getByUserId(userId: string): Promise<UserState> {
        const docs: UserState[] = await this.getData(userId);
        if (docs.length < 1) {
            return null;
        } else {
            return docs[0];
        }
    }

    async setByUserId(userId: string, state: UserState) {
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