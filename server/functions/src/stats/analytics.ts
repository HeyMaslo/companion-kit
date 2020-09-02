import db, { Repo } from 'server/services/db';
import { InvitesRepo, RecordRepo } from 'common/database/repositories';
import { DocumentSnapshot } from 'common/database/repositories/dbProvider';
import { createLogger } from 'common/logger';
import { Stats } from 'common/abstractions/functions.stats';

import {
    Invitation,
    ClientAccount,
    EntityWithStatus,
    ClientStatus,
    RecordData,
    UserProfile,
    UserRoles,
    ClientJournalEntry,
    SentimentAnalysis,
    Moods,
} from 'common/models';
import { arrayCount, roundNumber } from 'common/utils/mathx';
import normalizeFromMood = SentimentAnalysis.normalizeFromMood;
import fromSentiment = Moods.fromSentiment;

const logger = createLogger('[Analytics]');

const CacheInvalidationTimeMs = 1000 * 3600;
const databaseCache = {
    date: null as Date,
    data: null as DocumentSnapshot[][],
};

async function getDatabase(): Promise<DocumentSnapshot[][]> {
    const now = new Date();
    if (databaseCache.date && now.getTime() - databaseCache.date.getTime() < CacheInvalidationTimeMs && databaseCache.data) {
        return databaseCache.data;
    }

    const result: DocumentSnapshot[][] = await Promise.all([
        async function getInvitesDocs() {
            const invites = await Repo.Invites.collection.get();
            return invites.docs;
        }(),
        async function getAccountsDocs() {
            const accounts = await db.value.collectionGroup('accounts').get();
            return accounts.docs;
        }(),
        async function getRecordsDocs() {
            const records = await Repo.Records.collection.get();
            return records.docs;
        }(),
        async function getUsersDocs() {
            const users = await db.value.collection('users').get();
            return users.docs;
        }(),
        async function getJournalsDocs() {
            const journals = await db.value.collectionGroup('journal').get();
            return journals.docs;
        }(),
    ]);

    databaseCache.date = now;
    databaseCache.data = result;

    return result;
}

export async function getAnalytics(from?: number, to?: number): Promise<Stats.StatsTypes.Analytics.ResultItem[]> {
    const [ invitesDocs, accountsDocs, recordsDocs, usersDocs, journalsDocs ] = await getDatabase();

    const validateAccount = account => {
        const activeNow = account.status === ClientStatus.Active;
        const activeDate = EntityWithStatus.getLastStatusDate<ClientAccount, ClientStatus>(account, ClientStatus.Active);

        if (!activeDate) {
            if (!from || !to) {
                return activeNow;
            }
            return false;
        }
        return activeDate && (!from || activeDate >= from) && (!to || activeDate <= to);
    };

    const validateDate = (o: { date?: number }) => {
        if (!from || !to) {
            return true;
        }

        return o.date && (!from || o.date >= from) && (!to || o.date <= to);
    };

    const validateRecord = record => {
        if (record.type !== 'journal') {
            return false;
        }
        return validateDate(record);
    };

    const formattedUsers = {};
    usersDocs.forEach(d => {
        formattedUsers[d.id] = d.data() as UserProfile;
    });

    const accountJournals: {[value: string]: ClientJournalEntry[]} = {};
    journalsDocs.forEach(d => {
        const journal = d.data() as ClientJournalEntry;
        if (!accountJournals[journal.clientCardId]) {
            accountJournals[journal.clientCardId] = [];
        }
        accountJournals[journal.clientCardId].push(journal);
    });

    const results = await Promise.all<Stats.StatsTypes.Analytics.ResultItem>([
        async function getAverageMoodsChanges() {
            const allMoodChanges = accountsDocs
                .filter(acc => validateAccount(convertAccountDocs(acc)))
                .map(acc => {
                    let moodChanges: number = 0;

                    if (accountJournals[acc.id]) {
                        accountJournals[acc.id].filter(journal => validateDate(journal)).reduce(
                            (previous: ClientJournalEntry, current: ClientJournalEntry): ClientJournalEntry => {
                                if (current.mood !== previous.mood) {
                                    moodChanges++;
                                }

                                return current;
                            },
                        );
                    }

                    return moodChanges;
                }, 0);

            const changesCount = allMoodChanges.reduce((a, b) => a + b, 0);

            return {
                key: 'Average mood changes per client',
                value: roundNumber(changesCount / allMoodChanges.length),
            };
        }(),
        async function getMoodDistribution() {
            const sentiments = {
                count: 0,
                sum: 0,
            };
            const moods = {
                count: 0,
                sum: 0,
            };

            recordsDocs.forEach(doc => {
                const record = doc.data() as RecordData;
                if (validateRecord(record) && record.sentiment?.documentSentiment) {
                    sentiments.count++;
                    sentiments.sum += record.sentiment.documentSentiment.score || 0;
                }
            });

            journalsDocs.filter(doc => {
                const journal = doc.data() as ClientJournalEntry;
                return validateDate(journal);
            }).forEach(doc => {
                const journal = doc.data() as ClientJournalEntry;

                moods.count++;
                moods.sum += journal.mood || 0;
            });

            const averageSentiment = roundNumber(sentiments.sum / sentiments.count, 3);
            const moodFromSentiment = fromSentiment(averageSentiment);
            const averageMood = moods.count > 0 ? roundNumber(moods.sum / moods.count) : 0;
            const normalizeMood = roundNumber(normalizeFromMood(averageMood), 3);

            const averages = [
                `Self Reported Mood: ${normalizeMood} (${Moods.getTitle(averageMood)}) of ${moods.count} entries`,
                `Computed Sentiment: ${averageSentiment} (${Moods.getTitle(moodFromSentiment)}) of ${sentiments.count} entries`,
            ];

            return {
                key: 'Mood distribution',
                value: averages,
            };
        }(),
        async function getClientInvites() {
            const count = arrayCount(invitesDocs, d => {
                const inv = d.data() as Invitation;
                if (!Invitation.isClient(inv)) {
                    return false;
                }

                const dateCreated = Invitation.getLastStatusDate(inv, 'created', 'updated');
                if (!dateCreated) {
                    // old invites, are now active, will include them only if no range specified??
                    if (!from || !to) {
                        return true;
                    }
                }
                const ok = dateCreated && (!from || dateCreated >= from) && (!to || dateCreated <= to);
                return ok;
            });

            return {
                key: 'Client Active Invites Count',
                value: count,
            };
        }(),
        async function getActiveClientsCount() {
            const count = arrayCount(accountsDocs, d => {
                const acc = convertAccountDocs(d);
                const activeNow = acc.status === ClientStatus.Active;
                const activeDate = EntityWithStatus.getLastStatusDate<ClientAccount, ClientStatus>(acc, ClientStatus.Active);
                if (!activeDate) {
                    if (!from || !to) {
                        return activeNow;
                    }
                }
                return activeDate && (!from || activeDate >= from) && (!to || activeDate <= to);
            });

            return {
                key: 'Active Clients Count',
                value: count,
            };
        }(),
        async function getActiveClientsPerCoach() {
            const resp: CountByKeyResponse =
                arrayCountByKey(accountsDocs, 'coachId', validateAccount, convertAccountDocs);

            const accPerCoach = roundNumber(resp.sum / Object.keys(resp.results).length) || 0;

            return {
                key: 'Active Client Accounts per coach',
                value: accPerCoach,
            };
        }(),
        async function getSessionsPerCoach() {
        // TODO: move to validateRecord
            const validateSessionRecord = record => {
                if (record.type !== 'session') {
                    return false;
                }
                return validateDate(record);
            };

            const resp = arrayCountByKey(recordsDocs, 'coachUid', validateSessionRecord, f => f.data() as RecordData);

            const sessionPerCoach = roundNumber(resp.sum / Object.keys(resp.results).length) || 0;

            return {
                key: 'Sessions per coach',
                value: sessionPerCoach,
            };
        }(),
        async function getTotalJournals() {
            const count = arrayCount(recordsDocs, d => {
                const record = d.data() as RecordData;
                return validateRecord(record);
            });

            return {
                key: 'Total Number of Journals',
                value: count,
            };
        }(),
        async function getJournalsPerUser() {
            const resp: CountByKeyResponse =
                arrayCountByKey(recordsDocs, 'clientUid', validateRecord, f => f.data() as RecordData);

            const journalsPerUser = roundNumber(resp.sum / Object.keys(resp.results).length) || 0;

            return {
                key: 'Journals per User',
                value: journalsPerUser,
            };
        }(),
        async function getVoiceJournalsTime() {
            const count = recordsDocs.reduce((reducer, d) => {
                const record = d.data() as RecordData;
                const hasAudio = record.devsData && record.devsData.audioMeta;

                if (record.type !== 'journal' || !hasAudio) {
                    return reducer;
                }

                if (record.date && (!from || record.date >= from) && (!to || record.date <= to)) {
                    reducer = reducer + record.devsData.audioMeta.duration;
                }

                return reducer;
            }, 0);

            return {
                key: 'Minutes of Voice Journals',
                value: roundNumber(count / 60),
            };
        }(),
        async function getPercentOfAudio() {
            const data = recordsDocs.reduce((reducer, d) => {
                const record = d.data() as RecordData;

                if (record.type !== 'journal') {
                    return reducer;
                }

                const hasAudio = record.devsData && record.devsData.audioMeta;

                if (record.date && (!from || record.date >= from) && (!to || record.date <= to)) {
                    reducer.journals += 1;
                    reducer.withAudio = hasAudio ? reducer.withAudio + 1 : reducer.withAudio;
                }

                return reducer;
            }, {journals: 0, withAudio: 0});

            const count = roundNumber(data.withAudio / data.journals * 100) || 0;

            return {
                key: 'Percentage of Voice Journals',
                value: count,
            };
        }(),
        async function getUsersWithNotifications() {
            const data = usersDocs.reduce((reducer, d) => {
                const user = d.data() as UserProfile;
                if (UserRoles.Helper.contains(user.roles, UserRoles.Client)) {
                    reducer.clientsCount += 1;

                    // TODO
                    // reducer.withNotification =
                    //     user.notificationsLocalSchedule ? reducer.withNotification + 1 : reducer.withNotification;
                }

                return reducer;
            }, {clientsCount: 0, withNotification: 0});

            const count = roundNumber(data.withNotification / data.clientsCount * 100) || 0;

            return {
                key: 'Percentage of clients with notifications',
                value: count,
            };
        }(),
        async function getTopActiveUser() {
            const resp: CountByKeyResponse =
                arrayCountByKey(recordsDocs, 'clientUid', validateRecord, f => f.data() as RecordData);

            const sortedIds = Object.keys(resp.results)
                .sort((a, b) => {
                    return resp.results[b] - resp.results[a];
                }).slice(0, 20);

            const top = sortedIds.map(clientUid => {
                const user = formattedUsers[clientUid];

                return user.displayName || `${user.firstName} ${user.lastName}`;
            });

            return {
                key: 'Top 20 User',
                value: top,
            };
        }(),
        async function getTopCoaches() {
            const resp: CountByKeyResponse =
                arrayCountByKey(accountsDocs, 'coachName', validateAccount, convertAccountDocs);

            const top = Object.keys(resp.results)
                .sort((a, b) => {
                    return resp.results[b] - resp.results[a];
                }).slice(0, 20);

            return {
                key: 'Top 20 Coaches',
                value: top,
            };
        }(),
    ]);

    results.forEach(r => {
        if (r.value !== 0 && !r.value) {
            r.value = null;
        }
    });

    return results;
}

type ResultsObject = {
    [key: string]: number;
};

type CountByKeyResponse = {
    sum: number;
    results: ResultsObject;
};

function convertAccountDocs(doc) {
    const account = doc.data() as ClientAccount;
    if (!account.date && (account as any).statusUpdateTime) {
        account.date = (account as any).statusUpdateTime;
    }

    return account;
}

function arrayCountByKey<T, K>(arr: ReadonlyArray<T>, key: keyof K, condition: (o: K) => boolean, conversion?: (c: T) => K): CountByKeyResponse {
    const result: CountByKeyResponse = { results: { }, sum: 0 };
    if (!arr || !arr.length) {
        return result;
    }

    return arr.reduce((reducer: CountByKeyResponse, value: T) => {
        const vv: K = conversion ? conversion(value) : (value as unknown as K);

        // TODO: select better logic
        if (condition(vv)) {
            // let added = false;
            // reducer.results.map((item: any) => {
            //     if (item[0][key] === value[key]) {
            //         item.push(value);
            //         added = true;
            //     }
            //     return item;
            // });
            // if (!added) {
            //     reducer.results.push([value]);
            // }

            const innerValue = vv[key] as unknown as string;

            reducer.results[innerValue] = (reducer.results[innerValue] + 1) || 1;
            reducer.sum++;
        }

        return reducer;
    },  result);
}
