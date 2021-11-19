import { createLogger } from 'common/logger';
import { UserProfile, BillingInfo, UserPublicProfile, UserLocalSettingsIded, UserLocalSettings } from 'common/models';
import Identify from 'common/models/Identify';
import RepoError from './RepoError';
import Collections from 'common/database/collections';
import DBProvider, { getIdentify, serverOnly, documentSnapshot, UnsubscribeSnapshot, DocumentSnapshotCallback, DocumentSnapshot } from './dbProvider';

const logger = createLogger('[UserRepo]', false);

type UserProfileIded = Identify<UserProfile>;

export class UserRepo {
    constructor(protected readonly db: DBProvider) {

    }

    private get collection() { return this.db.collection(Collections.Users); }
    private get serverCollection() { return serverOnly(this.db).collection(Collections.Users); }

    getUserById(uid: string): Promise<UserProfileIded>;
    getUserById(uid: string, cb: DocumentSnapshotCallback<UserProfileIded>): Promise<UnsubscribeSnapshot>;

    getUserById(uid: string, cb: DocumentSnapshotCallback<UserProfileIded> = null): Promise<UserProfileIded | UnsubscribeSnapshot> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        return documentSnapshot(this.db, this.collection.doc(uid), cb);
    }

    async getPublicUserInfo(uid: string): Promise<UserPublicProfile> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        const res = await this.db.doc(Collections.userPublicInfoDoc(uid)).get();
        return res.exists ? res.data() as UserPublicProfile : null;
    }

    async getUserByEmail(email: string): Promise<UserProfileIded> {
        if (!email) {
            throw RepoError.InvalidArg('email');
        }

        const users = await this.collection
            .where('email', '==', email)
            .limit(1)
            .get();

        if (users.empty) {
            return null;
        }

        return getIdentify<UserProfileIded>(users.docs[0]);
    }

    async ensureAndUpdate(uid: string, profile: Partial<UserProfile>): Promise<UserProfileIded> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        const profileDoc = this.serverCollection.doc(uid);

        if (profile) {
            delete profile.billing;
            await profileDoc.set(profile, { merge: true });
        }

        const profileRes = await profileDoc.get();
        return getIdentify<UserProfileIded>(profileRes);
    }

    async updatePublicProfile(uid: string, info: Partial<UserPublicProfile>): Promise<void> {
        const publicProfileDoc = serverOnly(this.db).doc(Collections.userPublicInfoDoc(uid));
        await publicProfileDoc.set(info, { merge: true });
    }

    async deleteBilling(uid: string): Promise<UserProfileIded> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        try {
            const doc = this.serverCollection.doc(uid);
            await doc.set({ billing: null }, { merge: true });
            const res = await doc.get();
            return getIdentify<UserProfileIded>(res);
        } catch (err) {
            throw RepoError.InvalidArg(`An error during deleting billing: ${err.message}`);
        }
    }

    async updateBilling(uid: string, billing: Partial<BillingInfo>): Promise<UserProfileIded> {
        if (!uid) {
            throw RepoError.InvalidArg('uid');
        }

        const docRef = this.serverCollection.doc(uid);

        logger.log('UpdateBilling for user ID: ', uid, 'with new fields:', billing);
        logger.log('With new fields:', billing);

        await serverOnly(this.db).runTransaction(async t => {
            const doc = await t.get(docRef);

            if (!doc.exists) {
                throw 'Document does not exist';
            }

            let currentBilling = (doc.data() as UserProfile).billing;

            if (!currentBilling) {
                currentBilling = {} as BillingInfo;
            }

            if (billing.stripeUid && !currentBilling.stripeUid) {
                currentBilling.stripeUid = billing.stripeUid;
            }

            if (billing.trialPeriondEnd && !currentBilling.trialPeriondEnd) {
                currentBilling.trialPeriondEnd = billing.trialPeriondEnd;
            }

            if (billing.defaultSource) {
                currentBilling.defaultSource = billing.defaultSource;
            }

            if (billing.last4 !== undefined) {
                currentBilling.last4 = billing.last4;
            }

            if (billing.cancelAt !== undefined) {
                currentBilling.cancelAt = billing.cancelAt;
            }

            if (billing.subscriptionId !== undefined) {
                currentBilling.subscriptionId = billing.subscriptionId;
            }

            if (billing.planId !== undefined) {
                currentBilling.planId = billing.planId;
            }

            if (billing.plan !== undefined) {
                currentBilling.plan = billing.plan;
            }

            if (billing.planCategory !== undefined) {
                currentBilling.planCategory = billing.planCategory;
            }

            if (billing.maxClients !== undefined) {
                currentBilling.maxClients = billing.maxClients;
            }

            if (billing.paymentFailed != null) {
                currentBilling.paymentFailed = billing.paymentFailed;
            }

            if (billing.nextPaymentAttempt !== undefined) {
                currentBilling.nextPaymentAttempt = billing.nextPaymentAttempt;
            }

            return t.set(docRef, { billing: currentBilling }, { merge: true });
        });

        return await this.getUserById(uid);
    }

    async getAllLocalSettings(uid: string): Promise<UserLocalSettingsIded[]> {
        const colRef = this.db.collection(Collections.userLocalSettings(uid));
        const items = await colRef.get();
        const docs: DocumentSnapshot[] = items.docs;
        return docs.map(d => getIdentify<UserLocalSettingsIded>(d));
    }

    async findLocalSetting(deviceId: string) {
        const snap = await serverOnly(this.db)
            .collectionGroup(Collections.LocalSettings)
            .where('deviceId', '==', deviceId)
            .get();

        const results = snap.docs.map(d => {
            const settings = getIdentify<UserLocalSettingsIded & { userId: string }>(d);
            settings.userId = d.ref.parent.parent.id;
            return settings;
        });
        return results;
    }

    async getLocalSettings(uid: string, deviceId: string): Promise<UserLocalSettingsIded> {
        try {
            const docRef = this.db.doc(Collections.userLocalSettings(uid, deviceId));
            const doc = await docRef.get();
            return getIdentify<UserLocalSettingsIded>(doc);
        } catch (err) {
            logger.error('getLocalSettings: ', err);
        }
    }

    async updateLocalSettings(uid: string, deviceId: string, settings: Partial<UserLocalSettings>) {
        try {
            const docRef = this.db.doc(Collections.userLocalSettings(uid, deviceId));
            settings.deviceId = deviceId;
            // Patch for an error, notifications are not really setup yet
            if (settings.notifications == null) delete settings.notifications;
            await docRef.set(settings, { merge: true });
        } catch (err) {
            logger.error('updateLocalSettings: ', err);
        }
    }
}

export default UserRepo;
