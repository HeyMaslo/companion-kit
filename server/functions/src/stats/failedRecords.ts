import db, { Repo, Collections } from 'server/services/db';
import { getIdentify, serverOnly } from 'common/database/repositories/dbProvider';
import { RecordDataIded, ClientJournalEntryIded, ClientEntryIded, ClientSessionEntryIded, RecordAnalyzeState } from 'common/models';

function isRecordsMatches<T extends ClientEntryIded>(entry: T, type: 'journal' | 'session', r: RecordDataIded) {
    return r.type === type && r.entryId === entry.id
        && (!entry.clientUid || r.clientUid === entry.clientUid)
        && (!entry.coachUid || r.coachUid === entry.coachUid)
        && (!entry.clientCardId || !r.clientCardId || r.clientCardId === entry.clientCardId)
        && (!r.state || r.state === RecordAnalyzeState.Finished)
        && (!r.devsData || !r.devsData.error);
}

function findMatchingRecord<T extends ClientEntryIded>(entry: T, type: 'journal' | 'session', records: RecordDataIded[]) {
    return records.find(r => isRecordsMatches(entry, type, r));
}

function filterEntries<T extends ClientEntryIded>(entries: T[], type: 'journal' | 'session', records: RecordDataIded[]) {
    return entries.filter(j => {
        const existing = findMatchingRecord(j, type, records);
        return !existing;
    });
}

const dayMs = 24 * 3600 * 1000;

export async function getMissedRecords(startMs?: number, endMs?: number, deleteRecords?: boolean) {
    const start = startMs || (new Date().getTime() - 7 * dayMs);
    const end = endMs || new Date().getTime();

    const filterDocs = (query: FirebaseFirestore.Query) => query
        .where('date', '>=', start)
        .where('date', '<=', end)
        .get();

    const [journalsDocs, sessionsDocs, recordsDocs] = await Promise.all([
        filterDocs(serverOnly(db.value).collectionGroup('journal')),
        filterDocs(serverOnly(db.value).collectionGroup('sessions')),
        serverOnly(db.value).collection(Collections.Records).where('date', '>=', start).get(),
    ]);

    const records = recordsDocs.docs.map(recDoc => getIdentify<RecordDataIded>(recDoc));

    const journals = journalsDocs.docs.map(jdoc => getIdentify<ClientJournalEntryIded>(jdoc));
    const sessions = sessionsDocs.docs.map(sdoc => getIdentify<ClientSessionEntryIded>(sdoc));

    const missingJournals = filterEntries(journals, 'journal', records);
    const missingSessions = filterEntries(sessions, 'session', records);

    console.log(' =====> FETCHED ENTRIES AFTER', new Date(start), 'TILL', new Date(end),
        ':\r\nJOURNALS =', missingJournals.length, '/', journals.length,
        ' ; SESSIONS =', missingSessions.length, '/', sessions.length,
        '; TOTAL =', journals.length + sessions.length);

    const recordsToDelete = records.filter(r =>
        (r.type === 'journal' && journals.some(j => j.id === r.entryId && !isRecordsMatches(j, 'journal', r)))
    ||  (r.type === 'session' && sessions.some(s => s.id === r.entryId && !isRecordsMatches(s, 'session', r))))
        .map(r => r.id);

    console.log(' ======>> RECORS TO DELETE:', recordsToDelete.length, ' OF ', records.length,
        deleteRecords ? '\r\n=============== PROCESSING WITH DELETION' : '',
    );

    if (deleteRecords) {
        await Promise.all(recordsToDelete.map(rid => serverOnly(db.value).collection(Collections.Records).doc(rid).delete()));
    }

    return {
        journals: missingJournals,
        sessions: missingSessions,
    };
}

const formatDate = (d: number) => d ? new Date(d).toUTCString() : '???';

export async function getFailedRecordsHtml() {
    const result = await getMissedRecords();

    const lines = [
        `<h3> Missing records for Journals: ${result.journals.length} </h3>`,
        '<table>',
        `<th>
            <td>Date</td>
            <td>entryId</td>
            <td>clientUid</td>
            <td>coachUid</td>
            <td>clientCardId</td>
            <td>audioMeta</td>
        </th>`,
        ...result.journals.map((j, i) => `<tr>
            <td> ${i + 1} </td>
            <td> ${formatDate(j.date)} </td>
            <td> ${j.id} </td>
            <td> ${j.clientUid || '?'} </td>
            <td> ${j.coachUid || '?'} </td>
            <td> ${j.clientCardId || '?'} </td>
            <td> ${(j.audioMeta && JSON.stringify(j.audioMeta)) || '?'} </td>
        </tr>`),
        '</table>',

        `<h3> Missing records for Sessions: ${result.sessions.length} </h3>`,
        '<table>',
        `<th>
            <td>Date</td>
            <td>entryId</td>
            <td>clientUid</td>
            <td>coachUid</td>
            <td>clientCardId</td>
            <td>audioMeta</td>
        </th>
        `,
        ...result.sessions.map((s, i) => `<tr>
            <td> ${i + 1} </td>
            <td> ${formatDate(s.date)} </td>
            <td> ${s.id} </td>
            <td> ${s.clientUid || '?'} </td>
            <td> ${s.coachUid || '?'} </td>
            <td> ${s.clientCardId || '?'} </td>
            <td> ${(s.audioMeta && JSON.stringify(s.audioMeta)) || '?'} </td>
        </tr>`),
        '</table>',
    ];

    return lines.join('\r\n');
}
