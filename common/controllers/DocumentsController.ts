import { observable, transaction } from 'mobx';
import { createLogger } from 'common/logger';
import { getTimeSafe } from 'common/utils/dateHelpers';
import { DocumentEntryIded } from 'common/models';
import RepoFactory from './RepoFactory';
import { Unsubscriber } from 'common/utils/unsubscriber';

export const logger = createLogger('[DocumentsController]');

export class DocumentsController {
    @observable
    private _loading: boolean = null;

    @observable.ref
    protected _entries: DocumentEntryIded[] = [];

    private _coachId: string;
    private _clientCardId: string;

    private readonly _disposer = new Unsubscriber();

    static sortEntries(sessions: DocumentEntryIded[]) {
        sessions.sort((s1, s2) => getTimeSafe(s2.date) - getTimeSafe(s1.date));
    }

    protected get coachId() { return this._coachId; }
    protected get clientCardId() { return this._clientCardId; }

    get entries(): ReadonlyArray<DocumentEntryIded> { return this._entries; }
    get loading() { return this._loading; }

    getIsEntryExists(entryId: string) {
        return (this._loading == null || this._loading)
            ? null
            : !!this._entries.find(e => e.id === entryId);
    }

    setAccount(coachId: string, clientCardId: string) {
        if (this._coachId === coachId && this._clientCardId === clientCardId) {
            return;
        }

        this._coachId = coachId;
        this._clientCardId = clientCardId;

        this.fetchDocuments();
    }

    private async fetchDocuments() {
        this._disposer.execute('FETCH');

        if (!this._coachId || !this._clientCardId) {
            return;
        }

        this._loading = true;

        logger.log('Fetching items...');
        try {
            const unsub = await RepoFactory.Instance.clientCards.getDocuments(this._coachId, this._clientCardId, this.processItems);
            this._disposer.add(unsub, 'FETCH');
            logger.log('Subscribed to documents...');
        } catch (err) {
            logger.error('Failed to fetch entries. Error:', err);
            this._loading = false;
        }
    }

    private processItems = async (items: DocumentEntryIded[]) => {
        logger.log('Entries fetched count =', items.length);

        DocumentsController.sortEntries(items);

        transaction(() => {
            this._loading = false;
            this._entries = items;
        });

        await this.onItemsProcessed();
    }

    protected onItemsProcessed(): void | Promise<void> { /* no-op */ }

    dispose() {
        this._disposer.dispose();
    }
}
