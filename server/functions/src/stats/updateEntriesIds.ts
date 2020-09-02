import db, { Repo, Collections } from 'server/services/db';
import * as FirebaseAdmin from 'firebase-admin';
import { serverOnly, getIdentify } from 'common/database/repositories/dbProvider';
import { ClientJournalEntryIded, ClientSessionEntryIded } from 'common/models';

export async function updateEntriesIds(back?: number, periodDays?: number) {
    const lengthDays = periodDays || 7;
    const backDays = back || 0;

    const start = new Date();
    start.setUTCDate(start.getUTCDate() - backDays - lengthDays);

    const end = new Date();
    end.setUTCDate(end.getUTCDate() - backDays);

    const filterDocs = (query: FirebaseFirestore.Query) => query.where('date', '>', start.getTime())
        .where('date', '<', end.getTime())
        .get();

    const [journalsDocs, sessionsDocs] = await Promise.all([
        filterDocs(serverOnly(db.value).collectionGroup('journal')),
        filterDocs(serverOnly(db.value).collectionGroup('sessions')),
    ]);

    const [ journals, sessions ] = await Promise.all([
        Promise.all(journalsDocs.docs.map(jdoc => {
            const j = getIdentify<ClientJournalEntryIded>(jdoc);
            const accountDocRef = jdoc.ref.parent.parent;
            const clientDocRef = accountDocRef.parent.parent;
            j.clientCardId = accountDocRef.id;
            j.clientUid = clientDocRef.id;
            return j;
        })
        .sort((j1, j2) => j1.date - j2.date)
        .map(async j => {
            const acc = await Repo.Clients.getAccount(j.clientUid, j.clientCardId);
            j.coachUid = acc.coachId;
            const jj = await Repo.Clients.updateJournal(j.clientUid, j.clientCardId, j.id,
                {
                    clientUid: j.clientUid,
                    clientCardId: j.clientCardId,
                    coachUid: j.coachUid,
                });
            return jj;
        })),

        Promise.all(sessionsDocs.docs.map(sdoc => {
            const s = getIdentify<ClientSessionEntryIded>(sdoc);
            const clientCardDocRef = sdoc.ref.parent.parent;
            const coachDocRef = clientCardDocRef.parent.parent;
            s.clientCardId = clientCardDocRef.id;
            s.coachUid = coachDocRef.id;
            return s;
        })
        .sort((s1, s2) => s1.date - s2.date)
        .map(async s => {
            const card = await Repo.ClientCards.getClient(s.coachUid, s.clientCardId);
            s.clientUid = card.clientId;
            const ss = await Repo.ClientCards.updateSession(s.coachUid, s.clientCardId, s.id, {
                coachUid: s.coachUid,
                clientCardId: s.clientCardId,
                clientUid: s.clientUid,
            });
            return ss;
        })),
    ]);

    return {
        journals,
        sessions,
    };
}
