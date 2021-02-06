import TabsViewModel from 'app/viewModels/components/TabsViewModel';
import { Unsubscriber } from 'common/utils/unsubscriber';
import PromptsViewModel from 'app/viewModels/Prompts/PromptsViewModel';
import AppController from 'app/controllers';
import SchedulePageViewModel from 'app/viewModels/Prompts/SchedulePromptViewModel';
import { ClientJournalEntryIded } from 'common/models';
import { IClientPromptsController, PromptsActions } from 'app/controllers/Prompts.Client';
import { computed, observable } from 'mobx';

export class ManagePromptsViewModel {
    private readonly _tabs = new TabsViewModel();

    @observable
    private _prompts = new PromptsViewModel(() => this.client);
    private _schedule = new SchedulePageViewModel(() => this.client);
    @observable
    private _suggestedPrompt: string;
    private readonly _disposer: Unsubscriber = new Unsubscriber();

    constructor(
        private readonly _clientId: string,
    ) {
        this._disposer.add(this._prompts);
    }

    get tabs() { return this._tabs; }

    get client() { return AppController.Instance.User.clients.getModel(this._clientId); }

    get clientName() { return this.client.card.firstName && this.client.card.lastName ? `${this.client.card.firstName} ${this.client.card.lastName}` : null; }

    get prompts() { return this._prompts; }
    get schedule() { return this._schedule; }

    @computed
    get suggestedPrompt() {
        this.fetchSuggestedPrompt();
        return this._suggestedPrompt;
    }
    get clientState(): IClientPromptsController { return this.client.card.clientId ? AppController.Instance.User.prompts?.getClientState(this.client.card.clientId) : null }

    get latestTextCheckin() {
        const clientEntries: ReadonlyArray<ClientJournalEntryIded> = this.client.journal.entries;
        const transcriptions = clientEntries.filter(item => !!item.transcription);
        return !!transcriptions.length ? transcriptions[0].transcription : null;
    }

    fetchSuggestedPrompt = async () => {
        if (this.clientState && this.prompts.list && this.latestTextCheckin) {
            const response = await this.clientState.action(PromptsActions.FetchSuggestedPrompt, { prompts: this.prompts.list.map(prompt => prompt.text), journal: this.latestTextCheckin });
            this._suggestedPrompt = response.result;
        }
    }

    dispose() {
        this._disposer.dispose();
    }
}
