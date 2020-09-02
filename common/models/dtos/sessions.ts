import { ClientSessionEntryIded, ClientSessionEntry } from '..';
import Identify from '../Identify';

export type SessionsBaseDto = {
    clientCardId: string,
};

export type SessionsCreateDto = SessionsBaseDto & { session: ClientSessionEntry };
export type SessionsEditDto = SessionsBaseDto & { sessionId: string, diff: Partial<ClientSessionEntry>};

export type SessionsRequest = SessionsCreateDto | SessionsEditDto;

export type SessionsEditResponse = { ok: true, entry: Identify<ClientSessionEntry> } | { ok: false, error: string };
export type SessionsCreationResponse = ClientSessionEntryIded;
export type SessionsResponse = SessionsEditResponse | SessionsCreationResponse;

export namespace SessionsRequest {
    export function isCreate(r: SessionsRequest): r is SessionsCreateDto {
        const jud = r as SessionsCreateDto;
        return !!jud?.session;
    }

    export function isEdit(r: SessionsRequest): r is SessionsEditDto {
        const jed = r as SessionsEditDto;
        return !!jed?.sessionId && !!jed?.diff;
    }
}