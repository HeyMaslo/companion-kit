import { createLogger } from 'common/logger';
import { CoachProfile, IntelligentInsightFeedback, IntelligentInsightFeedbackIded } from 'common/models';
import Identify from 'common/models/Identify';
import RepoError from './RepoError';
import Collections from 'common/database/collections';
import DBProvider, {
    serverOnly,
    documentSnapshot,
    querySnapshot,
    getIdentify,
    UnsubscribeSnapshot,
    DocumentSnapshotCallback,
    QuerySnapshotCallback,
} from './dbProvider';
import { PromptsLibraryIded, ClientLibraryStateIded, PromptsLibrary, ClientLibraryState } from 'common/models/prompts';

const logger = createLogger('[CoachRepo]', false);

type CoachProfileIded = Identify<CoachProfile>;

class CoachRepo {

    constructor(protected readonly db: DBProvider) {

    }

    private get collection() { return this.db.collection(Collections.Coaches); }
    private get serverCollection() { return serverOnly(this.db).collection(Collections.Coaches); }

    getCoach(uid: string): Promise<CoachProfileIded>;
    getCoach(uid: string, cb: DocumentSnapshotCallback<CoachProfileIded>): Promise<UnsubscribeSnapshot>;

    async getCoach(uid: string, cb: DocumentSnapshotCallback<CoachProfileIded> = null): Promise<CoachProfileIded | UnsubscribeSnapshot> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        return documentSnapshot(this.db, this.collection.doc(uid), cb);
    }

    async ensureAndUpdate(uid: string, profile: Partial<CoachProfile>): Promise<CoachProfileIded> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        const doc = this.serverCollection
            .doc(uid);

        await doc.set(profile, { merge: true });
        const resDoc = await doc.get();
        return getIdentify<CoachProfileIded>(resDoc);
    }

    private getInsightsCollection(coachId: string, clientCardId: string) {
        return this.db.collection(Collections.insightsFeedback(coachId, clientCardId));
    }

    getInsightsFeedback(uid: string, clientCardId: string): Promise<IntelligentInsightFeedbackIded[]>;
    getInsightsFeedback(uid: string, clientCardId: string, cb: QuerySnapshotCallback<IntelligentInsightFeedbackIded>): Promise<UnsubscribeSnapshot>;

    getInsightsFeedback(uid: string, clientCardId: string, cb?: QuerySnapshotCallback<IntelligentInsightFeedbackIded>): Promise<IntelligentInsightFeedbackIded[] | UnsubscribeSnapshot> {
        const q = this.getInsightsCollection(uid, clientCardId);
        return querySnapshot(this.db, q, cb);
    }

    async saveInsightFeedback(uid: string, clientCardId: string, item: IntelligentInsightFeedback) {
        const docRef = this.getInsightsCollection(uid, clientCardId).doc();
        await docRef.set(item);
        const doc = await docRef.get();
        return getIdentify<CoachProfileIded>(doc);
    }

    getPromptsLibrary(coachUid: string): Promise<PromptsLibraryIded>;
    getPromptsLibrary(coachUid: string, cb: DocumentSnapshotCallback<PromptsLibraryIded>): Promise<UnsubscribeSnapshot>;

    getPromptsLibrary(coachUid: string, cb?: DocumentSnapshotCallback<PromptsLibraryIded>): Promise<PromptsLibraryIded | UnsubscribeSnapshot> {
        if (!coachUid) {
            throw new Error('invalid args');
        }

        const docRef = this.db.doc(Collections.promptsLibraryDoc(coachUid));
        return documentSnapshot(this.db, docRef, cb);
    }

    async updatePromptsLibrary(coachUid: string, diff: Partial<PromptsLibrary>): Promise<PromptsLibraryIded> {
        if (!coachUid) {
            throw new Error('invalid args');
        }

        const docRef = serverOnly(this.db).doc(Collections.promptsLibraryDoc(coachUid));
        await docRef.set(diff, { merge: true });

        const res = await docRef.get();
        return getIdentify<PromptsLibraryIded>(res);
    }

    getClientPrompts(coachUid: string, clientUid: string): Promise<ClientLibraryStateIded>;
    getClientPrompts(coachUid: string, clientUid: string, cb: DocumentSnapshotCallback<ClientLibraryStateIded>): Promise<UnsubscribeSnapshot>;

    getClientPrompts(coachUid: string, clientUid: string, cb?: DocumentSnapshotCallback<ClientLibraryStateIded>): Promise<ClientLibraryStateIded | UnsubscribeSnapshot> {
        if (!coachUid || !clientUid) {
            throw new Error('invalid args');
        }

        const docRef = this.db.doc(Collections.clientPromptsDoc(coachUid, clientUid));
        return documentSnapshot(this.db, docRef, cb);
    }

    async updateClientPrompts(coachUid: string, clientUid: string, diff: Partial<ClientLibraryState>): Promise<ClientLibraryStateIded> {
        if (!coachUid || !clientUid) {
            throw new Error('invalid args');
        }

        const docRef = serverOnly(this.db).doc(Collections.clientPromptsDoc(coachUid, clientUid));
        await docRef.set(diff, { merge: true });

        const res = await docRef.get();
        return getIdentify<ClientLibraryStateIded>(res);
    }
}

export default CoachRepo;
