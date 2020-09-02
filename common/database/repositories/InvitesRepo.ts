
import Collections from 'common/database/collections';
import DBProvider, { serverOnly } from './dbProvider';
import RepoError from './RepoError';
import { Invitation } from 'common/models/Invitation';

export default class InvitesRepo {
    constructor(readonly db: DBProvider) {

    }

    public get collection() { return this.db.collection(Collections.Invites); }
    private get serverCollection() { return serverOnly(this.db).collection(Collections.Invites); }

    async getInvite(email: string): Promise<Invitation> {
        if (!email) {
            throw RepoError.InvalidArg('email');
        }

        const doc = await this.serverCollection
            .doc(email)
            .get();

        if (!doc.exists) {
            return null;
        }

        const res = doc.data() as Invitation;
        res.email = doc.id;
        return res;
    }

    async createInvite(invite: Invitation): Promise<Invitation> {
        if (!invite) {
            throw RepoError.InvalidArg('invite');
        }

        if (!invite.email) {
            throw RepoError.InvalidArg('invite.email');
        }

        const doc = this.serverCollection.doc(invite.email);

        const existingDoc = await doc.get();
        const existing = existingDoc.exists && existingDoc.data() as Invitation;
        if (existing) {
            Invitation.changeStatus(existing, invite.status, invite.date);
            invite.history = existing.history || null;
        }

        await doc.set(invite);

        const res = (await doc.get()).data() as Invitation;
        res.email = doc.id;

        return res;
    }

    async udpate(email: string, diff: Partial<Invitation>) {
        if (diff.email) {
            throw new Error('Cannot change email');
        }

        const docRef = this.serverCollection.doc(email);
        const doc = await docRef.get();
        if (!doc.exists) {
            return;
        }

        const invite = doc.data() as Invitation;

        delete diff.email;

        // usedByUserId cannot be changed more than once
        if (invite.usedByUserId) {
            if ((diff as Object).hasOwnProperty('usedByUserId')) {
                throw new Error('Not able to change "usedByUserId" once it has been set');
            }

            delete diff.usedByUserId;
        }

        if (diff.status && invite.status !== diff.status) {
            Invitation.changeStatus(invite, diff.status, diff.date);
            diff.history = invite.history || null;
            diff.date = invite.date || new Date().getTime();
        }

        await docRef.set(diff, { merge: true });
    }

    async updateEmail(email: string, newEmail: string) {
        if (!newEmail || email === newEmail) {
            return false;
        }

        const current = await this.getInvite(email);
        if (!current) {
            return false;
        }

        current.email = newEmail;
        // create or update with new address
        await this.createInvite(current);

        // delete current
        const docRef = this.serverCollection.doc(email);
        const res = await docRef.delete();

        console.log('INVITES DB REPO: DELETED doc for', email, '; RESULT =', res);

        return true;
    }
}
