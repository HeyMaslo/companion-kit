import GenericRepo from './GenericRepo';
import { DocumentSnapshot, Query } from 'common/database/repositories/dbProvider';

export type UserData<T> = {
    userId: string,
    data: T,
};

export default class GenericUserRepo<T> extends GenericRepo<UserData<T>> {

    _query(userId: string): Query {
        return this.collection
        .where(nameof<UserData<T>>(d => d.userId), '==', userId);
    }

    async getDocs(userId: string): Promise<DocumentSnapshot[]> {
        const res = await this._query(userId).get();
        return res.docs;
    }

    async getData(userId: string): Promise<T[]> {
        const docs = await this.getDocs(userId);
        return docs.map((d: DocumentSnapshot) => (d.data() as UserData<T>).data);
    }

    async createUserData(userId: string, data: T) {
        return this.create({ userId, data });
    }

}