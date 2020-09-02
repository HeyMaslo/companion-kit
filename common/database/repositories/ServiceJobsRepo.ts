import Collections from 'common/database/collections';
import DBProvider, {
    querySnapshot, serverOnly, getIdentify,
} from './dbProvider';
import { StaticTipItemIded } from 'common/models/StaticTips';
import { ServiceJobIded, ServiceJob } from 'common/models';
import RepoError from './RepoError';

export default class ServiceJobsRepo {
    constructor(readonly db: DBProvider) { }

    public get collection() { return this.db.collection(Collections.ServiceJobs); }
    private get serverCollection() { return serverOnly(this.db).collection(Collections.ServiceJobs); }

    get(): Promise<StaticTipItemIded[]> {
        const query = this.collection;
        return querySnapshot(this.db, query);
    }

    async addServiceJob(serviceJob: ServiceJob) {
        const docRef = this.serverCollection.doc();
        await docRef.create(serviceJob);

        const doc = await docRef.get();
        return getIdentify<ServiceJobIded>(doc);
    }

    async ensureAndUpdate(jobId: string, jobPartial: Partial<ServiceJob>): Promise<ServiceJobIded> {
        if (!jobId) {
            throw RepoError.InvalidArg('uid');
        }

        const doc = this.serverCollection
            .doc(jobId);

        await doc.set(jobPartial, { merge: true });
        const resDoc = await doc.get();
        return getIdentify<ServiceJobIded>(resDoc);
    }

    async delete(serviceJobId: string) {
        const doc = this.serverCollection.doc(serviceJobId);

        const res = await doc.delete();
        return !!res;
    }
}
