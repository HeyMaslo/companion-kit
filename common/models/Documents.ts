import Identify from './Identify';
import { DocumentMeta } from './FileMeta';
import { EntityWithStatus } from './EntityWithStatus';

interface DocumentEntryBase {
    date?: number;

    name: string;

    // for better locating it
    clientUid?: string;
    coachUid?: string;
    clientCardId?: string;
}

export interface DocumentFileEntry extends DocumentEntryBase {
    type: 'file',
    documentMeta: DocumentMeta;
    fileRef: string;
}

export interface DocumentLinkEntry extends DocumentEntryBase {
    type: 'link',
    link: string,

    share?: DocumentLinkShareState,
}

export enum DocumentLinkShareStatuses {
    Sent = 'sent',
    Opened = 'opened',
    Revoked = 'revoked',
}

export type DocumentLinkShareState = EntityWithStatus<DocumentLinkShareStatuses>;

export namespace DocumentLinkShareState {
    export const ExpirationTimeoutMs = 72 * 3600 * 1000;

    export function isValid(state: DocumentLinkShareState) {
        return state?.status && state.date
            && (state.status === DocumentLinkShareStatuses.Sent || state.status === DocumentLinkShareStatuses.Opened)
            && !isExpired(state);
    }

    export function isExpired(state: DocumentLinkShareState) {
        return state?.date && Date.now() > state.date + ExpirationTimeoutMs;
    }

    export function changeStatus(state: DocumentLinkShareState, status: DocumentLinkShareStatuses, date: number = null) {
        return EntityWithStatus.changeStatus(state, status, date, true);
    }

    export function getLastStatusDate(state: DocumentLinkShareState, ...statuses: DocumentLinkShareStatuses[]) {
        return EntityWithStatus.getLastStatusDate(state, ...statuses);
    }
}

export type DocumentEntry = DocumentFileEntry | DocumentLinkEntry;
export type DocumentEntryIded = Identify<DocumentEntry>;

export namespace DocumentEntry {
    export function isLink(d: DocumentEntry): d is DocumentLinkEntry {
        return (d as DocumentLinkEntry)?.type === 'link';
    }
}
