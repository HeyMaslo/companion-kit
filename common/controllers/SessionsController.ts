import { observable, transaction } from 'mobx';
import { createLogger } from 'common/logger';
import { getTimeSafe } from 'common/utils/dateHelpers';
import { ClientSessionEntryIded } from 'common/models';
import RepoFactory from './RepoFactory';
import { SessionRecordDataIded } from 'common/models';

export const logger = createLogger('[SessionsController]');

export class SessionsController {
    @observable
    private _loading: boolean = null;

    @observable
    protected _entries: ClientSessionEntryIded[] = [];

    private _coachId: string;
    private _clientCardId: string;
    private _clientUid: string;

    private _unsubscribeEntries: () => void;

    static sortEntries(sessions: ClientSessionEntryIded[]) {
        sessions.sort((s1, s2) => getTimeSafe(s2.date) - getTimeSafe(s1.date));
    }

    protected get coachId() { return this._coachId; }
    protected get clientCardId() { return this._clientCardId; }

    get entries(): ReadonlyArray<ClientSessionEntryIded> { return this._entries; }
    get loading() { return this._loading; }

    getIsEntryExists(entryId: string) {
        return (this._loading == null || this._loading)
            ? null
            : !!this._entries.find(e => e.id === entryId);
    }

    setAccount(coachId: string, clientCardId: string, clientUid: string) {
        if (this._coachId === coachId && this._clientCardId === clientCardId) {
            return;
        }

        this._coachId = coachId;
        this._clientCardId = clientCardId;
        this._clientUid = clientUid;

        this.fetchSessions();
    }

    async findRecord(entryId: string): Promise<SessionRecordDataIded> {
        const record = await RepoFactory.Instance.records.getByEntryId(
            this._clientUid,
            this._coachId,
            entryId,
        );

        if (!record || record.type !== 'session') {
            return null;
        }

        return record;
    }

    private async fetchSessions() {
        this.unsubscribe();

        if (!this._coachId || !this._clientCardId) {
            return;
        }

        this._loading = true;

        logger.log('Fetching items...');
        try {
            const fetchRes = await RepoFactory.Instance.clientCards.getSessions(this._coachId, this._clientCardId, this.processItems);
            this._unsubscribeEntries = fetchRes;
            logger.log('Subscribed to sessions items...');
        } catch (err) {
            logger.error('Failed to fetch entries. Error:', err);
            this._loading = false;
        }
    }

    private processItems = (items: ClientSessionEntryIded[]) => {
        logger.log('Entries fetched count =', items.length);

        const observs = items.map(i => observable.object(i));

        SessionsController.sortEntries(observs);

        transaction(() => {
            this._loading = false;
            this._entries.length = 0;
            this._entries.push(...observs);
        });
    }

    private unsubscribe() {
        if (this._unsubscribeEntries) {
            this._unsubscribeEntries();
            this._unsubscribeEntries = null;
        }
    }

    dispose() {
        this.unsubscribe();
    }
}
