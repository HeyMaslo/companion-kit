import { FunctionFactory } from 'server/utils/createFunction';
import { Repo } from 'server/services/db';
import { AI as AIFunctions } from 'common/abstractions/functions';
import { processJournalEntry, processSessionEntry } from './analyze/records';
import AppHttpError from './utils/AppHttpError';
import { PubSub } from 'server/services/pubsub';
import { RecordDataIded, ClientEntry } from 'common/models';

async function processJournalWrap(data: AIFunctions.ProcessArgs, force = false) {

    const { clientUid, accountId: accountId, entryId } = data;

    const account = await Repo.Clients.getAccount(clientUid, accountId);
    if (!account) {
        throw AppHttpError.InvalidArguments({ name: nameof(accountId), error: `account was not found for ${clientUid} ${accountId}` });
    }
    const coachUid = account.coachId;

    if (force) {
        const existing = await Repo.Records.getByEntryId(clientUid, coachUid, entryId);
        if (existing) {
            await Repo.Records.delete(existing.id);
        }
    }

    let result: RecordDataIded;

    if (data.type === 'journal') {
        const journalEntry = await Repo.Clients.getJournal(clientUid, accountId, entryId);
        if (!journalEntry) {
            throw AppHttpError.InvalidArguments({ name: nameof(entryId), error: 'journal entry was not found' });
        }

        if (!journalEntry.clientUid) {
            journalEntry.clientUid = clientUid;
        }

        ensureEntryIds(journalEntry, clientUid, coachUid, account.id);
        result = await processJournalEntry(journalEntry);
    } else if (data.type === 'session') {
        const sessionEntry = await Repo.ClientCards.getSession(coachUid, account.id, data.entryId);
        if (!sessionEntry) {
            throw AppHttpError.InvalidArguments({ name: nameof(entryId), error: 'session entry was not found' });
        }

        ensureEntryIds(sessionEntry, clientUid, coachUid, account.id);
        result = await processSessionEntry(sessionEntry);
    }

    return result;
}

export const ProcessAudioEntry = new FunctionFactory(AIFunctions.ProcessAudioEntry)
    .create(async (data, ctx) => {
        const result = await processJournalWrap(data, !!data.force);
        return result;
    });

export const OnAudioEntryAdded = PubSub.Topics.AudioEntryUploaded.createTrigger(async data => {
    try {
        await processJournalWrap(data);
    } catch (err) {
        console.warn('Failed to process or save the record. See error below');
        console.error(err);
    }
});

function ensureEntryIds(entry: ClientEntry, clientUid: string, coachId: string, clientCardId: string) {
    if (!entry.clientUid) {
        entry.clientUid = clientUid;
    }

    if (!entry.coachUid) {
        entry.coachUid = coachId;
    }

    if (!entry.clientCardId) {
        entry.clientCardId = clientCardId;
    }
}

export const Functions = {
    [AIFunctions.ProcessAudioEntry.Name]: ProcessAudioEntry.AuthFunction,
    [PubSub.Topics.AudioEntryUploaded.triggerName]: OnAudioEntryAdded,
};
