import TabsViewModel from 'app/viewModels/components/TabsViewModel';
import { Unsubscriber } from 'common/utils/unsubscriber';
import PromptsViewModel from 'app/viewModels/Prompts/PromptsViewModel';
import AppController from 'app/controllers';
import SchedulePageViewModel from 'app/viewModels/Prompts/SchedulePromptViewModel';

export class ManagePromptsViewModel {
    private readonly _tabs = new TabsViewModel();

    private _prompts = new PromptsViewModel(() => this.client);
    private _schedule = new SchedulePageViewModel(() => this.client);

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

    dispose() {
        this._disposer.dispose();
    }
}
