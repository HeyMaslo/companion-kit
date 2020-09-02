import { observable, transaction } from 'mobx';
import { createLogger, ILogger } from 'common/logger';
import { getTimeSafe } from 'common/utils/dateHelpers';
import { ClientIntakeFormIded, AssessmentType } from 'common/models';
import { Unsubscriber, IDisposable } from 'common/utils/unsubscriber';
import RepoFactory from 'common/controllers/RepoFactory';
import { IAsyncController } from 'common/abstractions/controlllers/IAsyncController';
import { PromiseWrapper } from 'common/utils/promiseWrapper';

export class AssessmentItemController implements IDisposable, IAsyncController {
    @observable.ref
    protected _entries: ClientIntakeFormIded[] = [];

    @observable
    private _loading: boolean = null;

    private _disposer = new Unsubscriber();

    private _rangeSeconds: number;

    protected _coachUid: string;
    protected _clientCardId: string;
    protected _clientUid: string;

    private readonly _logger: ILogger;
    private readonly _loadWrapper: PromiseWrapper = new PromiseWrapper();

    static sortEntries(entries: ClientIntakeFormIded[]) {
        entries.sort((c1, c2) => getTimeSafe(c2.date) - getTimeSafe(c1.date));
    }

    constructor(private readonly _formType: AssessmentType) {
        this._logger = createLogger(`[IntakeForms:${_formType}]`);
        this._loadWrapper.begin();
    }

    get entries(): ReadonlyArray<ClientIntakeFormIded> { return this._entries; }
    get lastEntry() { return this.entries[this.entries.length - 1]; }
    get loading() { return this._loading; }

    setAccount(clientUid: string, accountId: string, coachUid: string) {
        if (this._clientUid === clientUid && this._clientCardId === accountId) {
            return;
        }

        transaction(() => {
            this._clientUid = clientUid;
            this._clientCardId = accountId;
            this._coachUid = coachUid;
        });

        if (this._clientUid && this._clientCardId) {
            this.fetchResponses();
        } else {
            this._logger.log('disabling...');
            this._loading = false;
            this._disposer.dispose();
        }
    }

    getIsEntryExists(entryId: string) {
        return (this._loading == null || this._loading)
            ? null
            : !!this._entries.find(e => e.id === entryId);
    }

    public ensureData() {
        return this._loadWrapper.promise;
    }

    private async fetchResponses() {
        this._disposer.dispose();

        if (!process.appFeatures.ASSESSMENTS_ENABLED) {
            return;
        }

        this._logger.log('Fetching intake forms responses...');

        this._loading = true;

        try {
            const from = this._rangeSeconds ? (Date.now() - this._rangeSeconds * 1000) : null;

            const unsub = await RepoFactory.Instance.clients.getIntakeFormsResponses(
                this._clientUid,
                this._clientCardId,
                this.processItems,
                {from, formType: this._formType},
            );

            this._disposer.add(unsub);
        } catch (err) {
            this._logger.error('Failed to fetch intake forms. Error:', err);
        } finally {
            this._loading = false;
            this._loadWrapper.resolve();
        }
    }

    private processItems = (items: ClientIntakeFormIded[]) => {
        this._logger.log('Fetched intake forms count =', items.length);

        AssessmentItemController.sortEntries(items);

        transaction(() => {
            this._loading = false;
            this._entries = items.sort((e1, e2) => e1.date - e2.date);
        });
    }

    dispose() {
        this._disposer.dispose();
    }
}
