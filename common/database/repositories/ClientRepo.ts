import Collections from 'common/database/collections';
import DBProvider, {
    Query,
    serverOnly,
    querySnapshot,
    documentSnapshot,
    UnsubscribeSnapshot,
    DocumentSnapshotCallback,
    getIdentify,
    QuerySnapshotCallback,
} from './dbProvider';
import {
    Identify,
    ClientProfile,
    ClientAccount,
    ClientStatus,
    ClientJournalEntryIded,
    ClientJournalEntry,
    ClientAccountIded,
    ClientIntakeForm,
    ClientIntakeFormIded,
    AssessmentData,
    AssessmentType,
} from 'common/models';
import RepoError from './RepoError';
import { createLogger } from 'common/logger';
import { AnyEvent, EventIded } from 'common/models/Events';

type AccountFilterParams = {
    coachId?: string;
    status?: ClientStatus;
};

type Options = {
    from?: number;
    to?: number;
    formType?: AssessmentType,
};

type ClientProfileIded = Identify<ClientProfile>;

const logger = createLogger('[ClientRepo]');

class ClientRepo {
    constructor(protected readonly db: DBProvider) {

    }

    private get collection() { return this.db.collection(Collections.Clients); }
    private get serverCollection() { return serverOnly(this.db).collection(Collections.Clients); }

    getClient(uid: string): Promise<ClientProfileIded>;
    getClient(uid: string, cb: DocumentSnapshotCallback<ClientProfileIded>): Promise<UnsubscribeSnapshot>;

    async getClient(uid: string, cb: DocumentSnapshotCallback<ClientProfileIded> = null): Promise<ClientProfileIded | UnsubscribeSnapshot> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        return documentSnapshot(this.db, this.collection.doc(uid), cb);
    }

    async ensure(uid: string, data: Partial<ClientProfile>): Promise<ClientProfileIded> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        const doc = this.serverCollection.doc(uid);
        await doc.set(data, { merge: true });

        const res = await doc.get();
        return getIdentify<ClientProfileIded>(res);
    }

    getAccount(uid: string, accountId: string): Promise<ClientAccountIded>;
    getAccount(uid: string, accountId: string, cb: DocumentSnapshotCallback<ClientAccountIded>): Promise<UnsubscribeSnapshot>;

    async getAccount(uid: string, accountId: string, cb: DocumentSnapshotCallback<ClientAccountIded> = null): Promise<ClientAccountIded | UnsubscribeSnapshot> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        const collection = this.db.collection(Collections.clientAccounts(uid));
        const docRef = collection.doc(accountId);

        return documentSnapshot(this.db, docRef, cb);
    }

    getAccounts(uid: string, params?: AccountFilterParams): Promise<ClientAccountIded[]>;
    getAccounts(uid: string, params: AccountFilterParams, cb: QuerySnapshotCallback<ClientAccountIded>): Promise<UnsubscribeSnapshot>;

    async getAccounts(uid: string, params: AccountFilterParams = null, cb: QuerySnapshotCallback<ClientAccountIded> = null): Promise<ClientAccountIded[] | UnsubscribeSnapshot> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        const path = Collections.clientAccounts(uid);
        const collection = this.db.collection(path);

        let query: Query = collection;
        if (params && params.status) {
            query = query.where('status', '==', params.status);
        }

        if (params && params.coachId) {
            query = query.where('coachId', '==', params.coachId);
        }
        return querySnapshot(this.db, query, cb);
    }

    createAccount(uid: string, clientCardId: string, account: ClientAccount): Promise<ClientAccountIded> {
        return this.updateOrCreateAccount(uid, clientCardId, account, true);
    }

    updateAccount(uid: string, accountId: string, account: Partial<ClientAccount>): Promise<ClientAccountIded> {
        return this.updateOrCreateAccount(uid, accountId, account, false);
    }

    private async updateOrCreateAccount(uid: string, accountId: string, data: Partial<ClientAccount>, create = false): Promise<ClientAccountIded> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        const collection = serverOnly(this.db).collection(Collections.clientAccounts(uid));
        const doc = collection.doc(accountId);
        if (!create) {
            await doc.set(data, { merge: true });
        } else {
            await doc.create(data);
        }

        const docRes = await doc.get();
        return getIdentify<ClientAccountIded>(docRes);
    }

    getJournal(clientUid: string, accountId: string, entryId: string): Promise<ClientJournalEntryIded>;
    getJournal(clientUid: string, accountId: string): Promise<ClientJournalEntryIded[]>;
    getJournal(clientUid: string, accountId: string, cb: QuerySnapshotCallback<ClientJournalEntryIded>): Promise<() => void>;

    async getJournal(clientUid: string, accountId: string, cb: QuerySnapshotCallback<ClientJournalEntryIded> | string = null) {
        const path = Collections.clientJournalEntries(clientUid, accountId);
        logger.log(`Getting journal items for client Uid = '${clientUid}', accountId = '${accountId}', path = ${path}`);
        const collection = this.db.collection(path);

        if (typeof cb === 'string') {
            const entryId = cb;
            const docRef = collection.doc(entryId);

            const doc = await docRef.get();
            return getIdentify<ClientJournalEntryIded>(doc);
        }

        return await querySnapshot(this.db, collection, cb);
    }

    async addJournalEntry(uid: string, accountId: string, entry: ClientJournalEntry) {
        const collection = serverOnly(this.db).collection(Collections.clientJournalEntries(uid, accountId));

        const docRef = collection.doc();
        await docRef.create(entry);

        const doc = await docRef.get();
        return getIdentify<ClientJournalEntryIded>(doc);
    }

    async deleteJournalEntry(uid: string, accountId: string, entryId: string): Promise<ClientJournalEntryIded> {
        const path = Collections.clientJournalEntries(uid, accountId);
        const collection = this.db.collection(path);

        const docRef = collection.doc(entryId);
        const doc = await docRef.get();
        if (doc.exists) {
            const result = getIdentify<ClientJournalEntryIded>(doc);
            await docRef.delete();
            return result;
        }

        return null;
    }

    async updateJournal(uid: string, accountId: string, entryId: string, entry: Partial<ClientJournalEntry>): Promise<ClientJournalEntryIded> {
        const path = Collections.clientJournalEntries(uid, accountId);
        const collection = serverOnly(this.db).collection(path);

        logger.log('updating journal id =', entryId, 'with diff:', entry);

        const docRef = collection.doc(entryId);
        await docRef.set(entry, { merge: true });

        const docRes = await docRef.get();
        return getIdentify<ClientJournalEntryIded>(docRes);
    }

    async addIntakeFormResponse(uid: string, accountId: string, entry: ClientIntakeForm) {
        const collection = serverOnly(this.db).collection(Collections.clientIntakeForms(uid, accountId));

        const docRef = collection.doc();
        await docRef.create(entry);

        const doc = await docRef.get();
        return getIdentify<ClientIntakeFormIded>(doc);
    }

    getIntakeFormsResponses(clientUid: string, accountId: string, cb: QuerySnapshotCallback<ClientIntakeFormIded>, options?: Options): Promise<() => void>;

    async getIntakeFormsResponses(clientUid: string, accountId: string, cb: QuerySnapshotCallback<ClientIntakeFormIded>, options?: Options) {
        const path = Collections.clientIntakeForms(clientUid, accountId);
        logger.log(`Getting intake forms responses for client Uid = '${clientUid}', accountId = '${accountId}', path = ${path}`);

        let query: Query = this.db.collection(path);

        if (options?.from != null) {
            const from = options.from;
            query = query.where(nameof<AssessmentData>(r => r.date), '>=', from);
        }

        if (options?.to != null) {
            const to = options.to;
            query = query.where(nameof<AssessmentData>(r => r.date), '<=', to);
        }

        if (options?.formType != null) {
            const formType = options.formType;
            query = query.where(nameof<AssessmentData>(r => r.formType), '==', formType);
        }

        return await querySnapshot(this.db, query, cb);
    }

    getClientEvents(clientUid: string, clientCardId: string): Promise<EventIded[]>;
    getClientEvents(clientUid: string, clientCardId: string, cb: QuerySnapshotCallback<EventIded>): Promise<UnsubscribeSnapshot>;

    getClientEvents(clientUid: string, clientCardId: string, cb?: QuerySnapshotCallback<EventIded>) {
        if (!clientUid || !clientCardId) {
            throw new Error('invalid args');
        }

        const docRef = this.db.collection(Collections.clientEvents(clientUid, clientCardId));
        return querySnapshot(this.db, docRef, cb);
    }

    async addClientEvent(entry: AnyEvent) {
        if (!entry.clientUid || !entry.clientCardId || !entry.coachUid) {
            throw new RepoError(RepoError.Types.InvalidArgs, 'missing ids in event object');
        }

        const collection = serverOnly(this.db).collection(Collections.clientEvents(entry.clientUid, entry.clientCardId));

        const docRef = collection.doc();
        await docRef.create(entry);

        const doc = await docRef.get();
        return getIdentify<EventIded>(doc);
    }

    async removeClientEvent(clientUid: string, clientCardId: string, entryId: string, skipCheck = false): Promise<EventIded> {
        const path = Collections.clientEvents(clientUid, clientCardId);
        const collection = serverOnly(this.db).collection(path);

        let result: EventIded;

        const docRef = collection.doc(entryId);
        if (!skipCheck) {
            const doc = await docRef.get();
            if (!doc.exists) {
                return null;
            }

            result = getIdentify<EventIded>(doc);
        }

        await docRef.delete();
        return result;
    }

    async updateClientEvent(clientUid: string, clientCardId: string, entryId: string, diff: Partial<AnyEvent>): Promise<EventIded> {
        const path = Collections.clientEvents(clientUid, clientCardId);
        const collection = serverOnly(this.db).collection(path);

        const docRef = collection.doc(entryId);
        await docRef.set(diff, { merge: true });

        const docRes = await docRef.get();
        return getIdentify<EventIded>(docRes);
    }
}

export default ClientRepo;
