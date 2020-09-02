import { observable, transaction, computed } from 'mobx';
import { createLogger } from 'common/logger';
import { getTimeSafe } from 'common/utils/dateHelpers';
import { ClientJournalEntryIded, JournalRecordDataIded, ImageReference } from 'common/models';
import RepoFactory from 'common/controllers/RepoFactory';
import { Unsubscriber } from 'common/utils/unsubscriber';
import { IAsyncController } from 'common/abstractions/controlllers/IAsyncController';
import { PromiseWrapper } from 'common/utils/promiseWrapper';

const logger = createLogger('[JournalController]');

const defaultEntryDate = new Date(0);

export class JournalController implements IAsyncController {
    @observable
    protected _entries: ClientJournalEntryIded[] = [];

    @observable
    private _loading: boolean = null;

    protected _coachUid: string;
    protected _clientCardId: string;
    protected _clientUid: string;

    private _recordsCache: { [id: string]: JournalRecordDataIded } = {};

    private _disposer = new Unsubscriber();
    private readonly _loadWrapper = new PromiseWrapper();

    static sortEntries(clients: ClientJournalEntryIded[]) {
        clients.sort((c1, c2) => getTimeSafe(c2.date, defaultEntryDate) - getTimeSafe(c1.date, defaultEntryDate));
    }

    constructor() {
        this._loadWrapper.begin();
    }

    get entries(): ReadonlyArray<ClientJournalEntryIded> { return this._entries; }
    get loading() { return this._loading; }

    @computed
    get images(): { ref: ImageReference, entry: ClientJournalEntryIded }[] {
        return this._entries?.filter(e => !!e.image?.storageRef)
            .map(e => ({
                entry: e,
                ref: e.image,
            })) || [];
    }

    getIsEntryExists(entryId: string) {
        return (this._loading == null || this._loading)
            ? null
            : !!this._entries.find(e => e.id === entryId);
    }

    setAccount(clientUid: string, accountId: string, coachUid: string) {
        if (this._clientUid === clientUid && this._clientCardId === accountId) {
            return;
        }

        transaction(() => {
            this._loading = null;
            this._clientUid = clientUid;
            this._clientCardId = accountId,
            this._coachUid = coachUid;
            this._recordsCache = { };
        });

        if (this._clientUid && this._clientCardId) {
            this.fetchJournal();
        }
    }

    public ensureData() {
        return this._loadWrapper?.promise;
    }

    async findRecord(entryId: string): Promise<JournalRecordDataIded> {
        const cached = this._recordsCache[entryId];
        if (cached) {
            return cached;
        }

        const record = await RepoFactory.Instance.records.getByEntryId(
            this._clientUid,
            this._coachUid,
            entryId,
        );

        if (!record || record.type !== 'journal') {
            return null;
        }

        this._recordsCache[entryId] = record;
        return record;
    }

    private async fetchJournal() {
        this._disposer.dispose();

        this._loading = true;

        logger.log('Fetching items...');
        try {
            const unsub = await RepoFactory.Instance.clients.getJournal(
                this._clientUid,
                this._clientCardId,
                this.processItems,
            );

            this._disposer.add(unsub);
        } catch (err) {
            logger.error('Failed to fetch entries. Error:', err);
            this._loading = false;
        } finally {
            this._loadWrapper.resolve();
        }
    }

    private processItems = (items: ClientJournalEntryIded[]) => {
        logger.log('Entries fetched count =', items.length);

        const observs = items.map(i => observable.object(i));

        JournalController.sortEntries(observs);

        transaction(() => {
            this._loading = false;
            this._entries.length = 0;
            this._entries.push(...observs);
        });
    }

    dispose() {
        this._disposer.dispose();
    }
}
