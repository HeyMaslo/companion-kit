import { observable, computed } from 'mobx';
import { ClientModel } from 'app/controllers/ClientModel';
import { JournalItem } from './ClientEntryItem';
import WebClientTracker, { Events } from 'app/services/webTracker';
import { ClientJournalEntryIded } from 'common/models';

export default class JournalListViewModel {
    @observable
    private _activeId: string;

    constructor(
        private readonly _clientGetter: () => ClientModel,
        private filter: (arr: readonly ClientJournalEntryIded[]) => readonly ClientJournalEntryIded[] = v => v,
    ) {}

    @computed
    get list(): ReadonlyArray<JournalItem> {
        const journalEntries = this.model.journal.entries;
        const filtered = this.filter(journalEntries);

        const list = filtered
            .map(e => new JournalItem(e, () => this.model).onActive(
                () => {
                    this._activeId = e.id;
                    WebClientTracker.Instance?.trackEvent(Events.Play('journalPage', this.clientName));
                },
            ),
        );
        return list;
    }

    get activeId() { return this._activeId; }

    get clientName() { return this.model.card.firstName && this.model.card.lastName ? `${this.model.card.firstName} ${this.model.card.lastName}` : null; }

    private get model() { return this._clientGetter(); }

    get clientId() {
        return this.model.card.id;
    }

    public stopAll = () => {
        this._activeId = undefined;
    }
}