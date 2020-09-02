import { observable, transaction } from 'mobx';
import logger, { ILogger, createLogger } from 'common/logger';
import RepoFactory from 'common/controllers/RepoFactory';
import { Entity } from 'common/models/EntityReference';
import {
    RecordDataIded,
    WordReference,
    SentimentItem,
    SentimentAnalysis,
} from 'common/models';
import { Unsubscriber } from 'common/utils/unsubscriber';
import { IAsyncController } from 'common/abstractions/controlllers/IAsyncController';
import { PromiseWrapper } from 'common/utils/promiseWrapper';

const ITEMS_UNSUBSCRIBE_ID = 'ITEMS';

export interface IRecordReference {
    readonly record: RecordDataIded;
}

export class RecordsController implements IAsyncController {
    @observable
    private _loading: boolean = null;

    @observable.ref
    private _words: WordReference[] = [];

    @observable.ref
    private _sentiments: SentimentItem[] = [];

    @observable.ref
    private _items: ReadonlyArray<RecordDataIded> = [];

    private _logger: ILogger = createLogger(`[Records:?]`);
    private _unsubscriber = new Unsubscriber();
    private readonly _loadWrapper = new PromiseWrapper();

    private readonly _recordObserversCache = new Map<string, IRecordReference>();
    private readonly _recordsCache = new Map<string, IRecordReference>();

    private _rangeSeconds: number;
    private _clientUid: string;
    private _coachId: string;

    constructor() {
        this._loadWrapper.begin();
    }

    get clientUid() { return this._clientUid; }
    get coachId() { return this._coachId; }

    get loading() { return this._loading; }
    get items(): ReadonlyArray<RecordDataIded> { return this._items; }
    get journals(): ReadonlyArray<RecordDataIded> { return this._items.filter(item => item.type === 'journal'); }

    get sentiments() { return this._sentiments; }
    get words() { return this._words; }

    // public setRange(seconds: number) {
    //     if (this._rangeSeconds === seconds) {
    //         return;
    //     }

    //     this._logger.log('New range:', seconds);
    //     this._rangeSeconds = seconds;
    //     this.fetchRecords();
    // }

    public ensureData() {
        return this._loadWrapper?.promise;
    }

    public setLoggerName(name: string) {
        this._logger = createLogger(`[Records:${name}]`);
    }

    public setClient(coachUid: string, clientUid: string, loggerName?: string) {
        if (loggerName) {
            this.setLoggerName(loggerName);
        }

        const changed = this._clientUid !== clientUid || this._coachId !== coachUid;
        if (!changed) {
            return;
        }

        this._clientUid = clientUid;
        this._coachId = coachUid;

        if (changed) {
            this.fetchRecords();
        }
    }

    private async fetchRecords() {
        this.unsubscribe();

        if (!this._clientUid || !this._coachId) {
            this.processRecords([]);
            return;
        }

        this._loading = true;

        this._logger.log('Fetching...');
        try {
            // const from = this._rangeSeconds ? (new Date().getTime() - this._rangeSeconds * 2 * 1000) : null;

            const fetchRes = await RepoFactory.Instance.records.get({
                clientUid: this._clientUid,
                coachUid: this._coachId,
            }, {}, this.processRecords);

            this._unsubscriber.add(fetchRes, ITEMS_UNSUBSCRIBE_ID);
            this._logger.log('Subscribed...');
        } catch (err) {
            this._logger.error('Failed to fetch records. Error:', err);
            this._loading = false;
        } finally {
            this._loadWrapper.resolve();
        }
    }

    public initWithRecords(items: ReadonlyArray<RecordDataIded>) {
        this.unsubscribe();

        this._clientUid = null;
        this._coachId = null;

        this.processRecords(items);
    }

    private processRecords = (items: ReadonlyArray<RecordDataIded>) => {
        this._logger.log('Fetched records =', items.length);

        transaction(() => {
            this._loading = false;
            this._items = items;

            if (items.length === 0) {
                return;
            }

            const allEntities: Entity[] = [];
            items.forEach(i => {
                if (i.entities) {
                    allEntities.push(...i.entities);
                }
            });

            this._words = WordReference.fromEntities(allEntities);

            this._sentiments = items.map(i => ({
                ...SentimentAnalysis.getValue(i.sentiment),
                date: i.date,
            }));
        });
    }

    public observeRecord(entryId: string): IRecordReference {
        const existing = this._recordObserversCache.get(entryId);
        if (existing) {
            return existing;
        }

        const parent = this;
        const observer: IRecordReference = observable.object({
            get record() {
                return parent.items.find(i => i.entryId === entryId);
            },
        });
        this._recordObserversCache.set(entryId, observer);
        return observer;
    }

    public async findRecord(id: string): Promise<IRecordReference> {
        const existing = this._recordsCache.get(id);
        if (existing) {
            return existing;
        }

        let fetched: RecordDataIded;
        try {
            fetched = this._items.find(i => i.entryId === id);
            if (!fetched) {
                fetched = await RepoFactory.Instance.records.getByEntryId(
                    this._clientUid,
                    this._coachId,
                    id,
                );
            }

            const ref: IRecordReference = {
                get record() { return fetched; },
                // get entryId() { return id; },
            };
            this._recordsCache.set(id, ref);
            return ref;
        } finally {
            this._logger.log('Fetched a record:', id, '=>', fetched && fetched.id);
        }
    }

    private unsubscribe() {
        this._unsubscriber.execute(ITEMS_UNSUBSCRIBE_ID);
    }

    dispose = () => {
        this._unsubscriber.dispose();
        this._recordObserversCache.clear();
        this._recordsCache.clear();
    }
}
