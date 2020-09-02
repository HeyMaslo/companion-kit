import { ClientJournalEntry, ClientJournalEntryIded } from 'common/models/ClientEntries';

export type JournalBaseDto = {
    accountId: string,
};

export type JournalUploadDto = JournalBaseDto & { entry: ClientJournalEntry };
export type JournalEditDto = JournalBaseDto & { entryId: string, diff: Pick<ClientJournalEntry, 'private'> };

export type JournalRequest = JournalUploadDto | JournalEditDto;
export type JournalResponse = ClientJournalEntryIded;

export namespace JournalRequest {
    export function isEdit(r: JournalRequest): r is JournalEditDto {
        const jed = r as JournalEditDto;
        return !!jed?.entryId && !!jed?.diff;
    }

    export function isCreate(r: JournalRequest): r is JournalUploadDto {
        const jud = r as JournalUploadDto;
        return !!jud?.entry;
    }
}
