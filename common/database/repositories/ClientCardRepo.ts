import Collections from 'common/database/collections';
import DBProvider, { serverOnly, querySnapshot, QuerySnapshotCallback, DocumentSnapshotCallback, UnsubscribeSnapshot, getIdentify, documentSnapshot } from './dbProvider';
import {
    ClientCardIded,
    ClientCard,
    ClientSessionEntryIded,
    ClientSessionEntry,
    DocumentEntryIded,
    DocumentEntry,
    ClientStatus,
} from 'common/models';
import { createLogger } from 'common/logger';
import { TimeTrackingEntry, TimeTrackingEntryIded } from 'common/models/TimeTracking';

const logger = createLogger('[ClientCardRepo]');

class ClientCardRepo {
    constructor(protected readonly db: DBProvider) { }

    private getCollection(coachId: string) { return this.db.collection(Collections.coachClients(coachId)); }
    private getServerCollection(coachId: string) { return serverOnly(this.db).collection(Collections.coachClients(coachId)); }

    getClients(coachId: string): Promise<ClientCardIded[]>;
    getClients(coachId: string, cb: QuerySnapshotCallback<ClientCardIded>): Promise<ClientCardIded[] | UnsubscribeSnapshot>;

    getClients(coachId: string, cb: QuerySnapshotCallback<ClientCardIded> = null) {
        return querySnapshot(this.db, this.getCollection(coachId), cb);
    }

    async getClientsByEmail(email: string, coachUid?: string, ...statuses: ClientStatus[]) {
        const query = coachUid
            ? this.getServerCollection(coachUid)
            : serverOnly(this.db).collectionGroup('clients');

        const qu = query.where('email', '==', email);

        const snapshot = await qu.get();
        const result = (snapshot.docs || []).map(d => {
            const res = getIdentify<ClientCardIded & { coachId: string }>(d);
            res.coachId = d.ref.parent.parent.id;
            return res;
        });

        if (statuses?.length) {
            return result.filter(cc => statuses.includes(cc.status));
        }

        return result;
    }

    async getClient(coachId: string, cardId: string): Promise<ClientCardIded> {
        const collection = this.getCollection(coachId);
        const docRef = await collection.doc(cardId).get();
        if (!docRef.exists) {
            return null;
        }

        const res = docRef.data() as ClientCardIded;
        res.id = docRef.id;
        return res;
    }

    async create(coachId: string, data: Partial<ClientCard>): Promise<ClientCardIded> {
        const collection = this.getServerCollection(coachId);
        const docRef = collection.doc();

        await docRef.create(data);

        const res = await docRef.get();
        const card = res.data() as ClientCardIded;
        card.id = docRef.id;
        return card;
    }

    async update(coachId: string, cardId: string, diff: Partial<ClientCard>): Promise<ClientCardIded> {
        const collection = this.getServerCollection(coachId);
        const docRef = collection.doc(cardId);

        const cardDoc = await docRef.get();
        if (!cardDoc.exists) {
            throw new Error(`Client Card does not exist: ${docRef.path}`);
        }
        const card = getIdentify<ClientCardIded>(cardDoc);
        if (diff.status && card.status !== diff.status) {
            ClientCard.changeStatus(card, diff.status, diff.date);
            diff.history = card.history || null;
            diff.date = card.date || Date.now();
        }

        await docRef.update(diff);
        Object.assign(card, diff);

        return card;
    }

    async delete(coachId: string, cardId: string) {
        const collection = this.getServerCollection(coachId);
        const docRef = collection.doc(cardId);

        const res = await docRef.delete();
        return !!res;
    }

    getSessions(coachId: string, clientCardId: string): Promise<ClientSessionEntryIded[]>;
    getSessions(coachId: string, clientCardId: string, cb: QuerySnapshotCallback<ClientSessionEntryIded>): Promise<UnsubscribeSnapshot>;

    getSessions(coachId: string, clientCardId: string, cb: QuerySnapshotCallback<ClientSessionEntryIded> = null)
        : Promise<ClientSessionEntryIded[] | UnsubscribeSnapshot> {
        return querySnapshot(this.db, this.db.collection(Collections.sessions(coachId, clientCardId)), cb);
    }

    async getSession(coachId: string, clientCardId: string, sessionId: string): Promise<ClientSessionEntryIded> {
        const collection = this.db.collection(Collections.sessions(coachId, clientCardId));

        const docRef = collection.doc(sessionId);
        const doc = await docRef.get();
        const res = doc.data() as ClientSessionEntryIded;
        res.id = doc.id;
        return res;
    }

    async createSession(coachId: string, clientCardId: string, session: ClientSessionEntry): Promise<ClientSessionEntryIded> {
        const collection = serverOnly(this.db).collection(Collections.sessions(coachId, clientCardId));

        const docRef = collection.doc();

        await docRef.create(session);

        const data = (await docRef.get()).data() as ClientSessionEntryIded;
        data.id = docRef.id;

        return data;
    }

    async deleteSession(coachId: string, clientCardId: string, sessionId: string): Promise<ClientSessionEntryIded> {
        const collection = this.db.collection(Collections.sessions(coachId, clientCardId));
        const docRef = collection.doc(sessionId);

        const doc = await docRef.get();

        if (doc.exists) {
            const res = doc.data() as ClientSessionEntryIded;
            res.id = doc.id;

            await docRef.delete();
            return res;
        }

        return null;
    }

    async updateSession(coachId: string, clientCardId: string, entryId: string, entry: Partial<ClientSessionEntry>): Promise<ClientSessionEntryIded> {
        const collection = serverOnly(this.db).collection(Collections.sessions(coachId, clientCardId));
        const docRef = collection.doc(entryId);

        logger.log('updating session id =', entryId, 'with diff:', entry);
        await docRef.set(entry, { merge: true });

        const docRes = await docRef.get();
        return getIdentify<ClientSessionEntryIded>(docRes);
    }

    getDocuments(coachId: string, clientCardId: string): Promise<DocumentEntryIded[]>;
    getDocuments(coachId: string, clientCardId: string, cb: QuerySnapshotCallback<DocumentEntryIded>): Promise<UnsubscribeSnapshot>;

    getDocuments(coachId: string, clientCardId: string, cb: QuerySnapshotCallback<DocumentEntryIded> = null)
        : Promise<DocumentEntryIded[] | UnsubscribeSnapshot> {
        return querySnapshot(this.db, this.db.collection(Collections.documents(coachId, clientCardId)), cb);
    }

    getDocument(coachId: string, clientCardId: string, docId: string): Promise<DocumentEntryIded>;
    getDocument(coachId: string, clientCardId: string, docId: string, cb: DocumentSnapshotCallback<DocumentEntryIded>): Promise<UnsubscribeSnapshot>;

    getDocument(coachId: string, clientCardId: string, docId: string, cb: DocumentSnapshotCallback<DocumentEntryIded> = null): Promise<DocumentEntryIded | UnsubscribeSnapshot> {
        const docRef = this.db.collection(Collections.documents(coachId, clientCardId)).doc(docId);
        return documentSnapshot(this.db, docRef, cb);
    }

    // TODO: create/update/delete for different entries looks similar, maybe need to combine
    async createDocument(coachId: string, clientCardId: string, document: DocumentEntry): Promise<DocumentEntryIded> {
        const collection = serverOnly(this.db).collection(Collections.documents(coachId, clientCardId));

        const docRef = collection.doc();

        await docRef.create(document);

        const data = (await docRef.get()).data() as DocumentEntryIded;
        data.id = docRef.id;

        return data;
    }

    async updateDocument(coachId: string, clientCardId: string, entryId: string, entry: Partial<DocumentEntry>): Promise<DocumentEntryIded> {
        const collection = serverOnly(this.db).collection(Collections.documents(coachId, clientCardId));
        const docRef = collection.doc(entryId);

        logger.log('updating document id =', entryId, 'with diff:', entry);
        await docRef.set(entry, { merge: true });

        const docRes = await docRef.get();

        return getIdentify<DocumentEntryIded>(docRes);
    }

    async deleteDocument(coachId: string, clientCardId: string, documentId: string): Promise<DocumentEntryIded> {
        const collection = this.db.collection(Collections.documents(coachId, clientCardId));
        const docRef = collection.doc(documentId);

        const doc = await docRef.get();

        if (doc.exists) {
            const res = doc.data() as DocumentEntryIded;
            res.id = doc.id;

            await docRef.delete();
            return res;
        }

        return null;
    }

    getTimeTrackings(coachId: string, clientCardId: string): Promise<TimeTrackingEntryIded[]>;
    getTimeTrackings(coachId: string, clientCardId: string, cb: QuerySnapshotCallback<TimeTrackingEntryIded>): Promise<UnsubscribeSnapshot>;

    getTimeTrackings(coachId: string, clientCardId: string, cb: QuerySnapshotCallback<TimeTrackingEntryIded> = null)
        : Promise<TimeTrackingEntryIded[] | UnsubscribeSnapshot> {
        return querySnapshot(this.db, this.db.collection(Collections.timeTracking(coachId, clientCardId)), cb);
    }

    async createTimeTracking(coachId: string, clientCardId: string, timeTracking: TimeTrackingEntry): Promise<TimeTrackingEntryIded> {
        const collection = serverOnly(this.db).collection(Collections.timeTracking(coachId, clientCardId));

        const docRef = collection.doc();

        await docRef.create(timeTracking);

        const data = (await docRef.get()).data() as TimeTrackingEntryIded;
        data.id = docRef.id;

        return data;
    }

    async updateTimeTracking(coachId: string, clientCardId: string, entryId: string, entry: Partial<TimeTrackingEntry>): Promise<TimeTrackingEntryIded> {
        const collection = serverOnly(this.db).collection(Collections.timeTracking(coachId, clientCardId));
        const docRef = collection.doc(entryId);

        logger.log('updating timeTracking id =', entryId, 'with diff:', entry);
        await docRef.set(entry, { merge: true });

        const docRes = await docRef.get();

        return getIdentify<TimeTrackingEntryIded>(docRes);
    }

    async deleteTimeTracking(coachId: string, clientCardId: string, timeTrackingId: string): Promise<TimeTrackingEntryIded> {
        const collection = this.db.collection(Collections.timeTracking(coachId, clientCardId));
        const docRef = collection.doc(timeTrackingId);

        const doc = await docRef.get();

        if (doc.exists) {
            const res = doc.data() as TimeTrackingEntryIded;
            res.id = doc.id;

            await docRef.delete();
            return res;
        }

        return null;
    }
}

export default ClientCardRepo;
