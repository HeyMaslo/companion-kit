import Collections from 'common/database/collections';
import DBProvider, { serverOnly, Query, querySnapshot, getIdentify, QuerySnapshotCallback, UnsubscribeSnapshot } from './dbProvider';
import { RecordData } from 'common/models';
import { RecordDataIded, RecordBaseData } from 'common/models/RecordData';
import RepoError from './RepoError';
import logger, { createLogger } from 'common/logger';

const loggeer = createLogger('[RecordRepo]');

type RecordsRefs = {
    clientUid: string,
    coachUid: string,
};

type RecordsFetchFilters = {
    from?: number,
    to?: number,
    limit?: number,
};

class RecordRepo {
    constructor(protected readonly db: DBProvider) { }

    public get collection() { return this.db.collection(Collections.Records); }
    private get serverCollection() { return serverOnly(this.db).collection(Collections.Records); }

    async create(record: RecordBaseData, updateExisting = true): Promise<RecordDataIded> {
        const collection = this.serverCollection;

        const existing = await this.getByEntryId(record.clientUid, record.coachUid, record.entryId);
        if (existing && !updateExisting) {
            throw RepoError.AlreadyExists(
                `This record exists already: clientUid = ${record.clientUid}, coachUid = ${record.coachUid}, entryId = ${record.entryId}`);
        }

        if (existing) {
            logger.log('Upating record id =', existing.id);
        } else {
            loggeer.log('Creating record, clientUid =', record.clientUid, '; coachUid =', record.coachUid, '; entryId =', record.entryId);
        }

        const docRef = existing
            ? collection.doc(existing.id)
            : collection.doc();

        await docRef.set(record);
        const doc = await docRef.get();
        return getIdentify<RecordDataIded>(doc);
    }

    async getByEntryId(clientUid: string, coachUid: string, entryId: string): Promise<RecordDataIded> {
        const snapshot = await this.collection
            .where(nameof<RecordData>(r => r.clientUid), '==', clientUid)
            .where(nameof<RecordData>(r => r.coachUid), '==', coachUid)
            .where(nameof<RecordData>(r => r.entryId), '==', entryId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        return getIdentify<RecordDataIded>(snapshot.docs[0]);
    }

    get(refs: RecordsRefs, options?: RecordsFetchFilters): Promise<RecordDataIded[]>;
    get(refs: RecordsRefs, options?: RecordsFetchFilters, cb?: QuerySnapshotCallback<RecordDataIded>): Promise<UnsubscribeSnapshot>;

    async get(
        refs: RecordsRefs,
        options: RecordsFetchFilters = { },
        cb?: (items: RecordDataIded[]) => void,
    ) {
        let query: Query = this.collection
            .orderBy(nameof<RecordData>(r => r.date))
            .where(nameof<RecordData>(r => r.clientUid), '==', refs.clientUid)
            .where(nameof<RecordData>(r => r.coachUid), '==', refs.coachUid);

        if (options?.from != null) {
            const from = options.from;
            query = query.where(nameof<RecordData>(r => r.date), '>=', from);
        }

        if (options?.to != null) {
            const to = options.to;
            query = query.where(nameof<RecordData>(r => r.date), '<=', to);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        return querySnapshot<RecordDataIded>(this.db, query, cb);
    }

    async delete(recordId: string) {
        const doc = this.collection.doc(recordId);

        const res = await doc.delete();

        return true;
    }

    // TODO: remove if not need
    async getAll(
        type: string,
        options: { from?: number, to?: number, cb?: (items: RecordDataIded[]) => void } = null,
    ) {
        let query: Query = this.collection
            .orderBy(nameof<RecordData>(r => r.date))
            .where(nameof<RecordData>(r => r.type), '==', type);

        if (options && options.from != null) {
            const from = options.from;
            query = query.where(nameof<RecordData>(r => r.date), '>=', from);
        }

        if (options && options.to != null) {
            const to = options.to;
            query = query.where(nameof<RecordData>(r => r.date), '<=', to);
        }

        return querySnapshot<RecordDataIded>(this.db, query, options && options.cb);
    }
}

export default RecordRepo;
