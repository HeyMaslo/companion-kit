import { observable, computed } from 'mobx';
import logger from 'common/logger';
import { TimeTrackingEntryIded } from 'common/models/TimeTracking';
import AppController from 'app/controllers';
import { ClientModel } from 'app/controllers/ClientModel';
import { TimeTrackingFormVM } from 'app/viewModels/TimeTracking/TimeTrackingFormViewModel';
import { Unsubscriber } from 'common/utils/unsubscriber';

export class TimeTrackingListItem {
    @observable
    private _loading: boolean;

    constructor(
        protected readonly entry: TimeTrackingEntryIded,
        private readonly _clientGetter: () => ClientModel,
    ) {}

    protected get client() { return this._clientGetter(); }

    public get loading() {return this._loading; }

    get id() { return this.entry.id; }
    get activity() { return this.entry.activity; }
    get date() { return this.entry.date; }
    get diagnosis() { return this.entry.diagnosis; }
    get time() { return this.entry.minutes; }
    get notes(): string { return this.entry.notes; }
    get billable() { return this.entry.billable ? 'Yes' : 'No'; }

    public removeTracking = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Are you sure?',
            message: 'Deleted entries can’t be restored.',
            confirmText: 'Delete',
            rejectText: 'Cancel',
            onConfirm: this.doRemoveTracking,
        });
    }

    public duplicateTracking = async () => {
        try {
            this._loading = true;

            const result = await this.client.timeTracking.duplicate(this.entry.id);

            if (!result) {
                logger.error('Failed to duplicate tracking');
                return;
            }
        } catch (err) {
            logger.error('Unexpected error during tracking duplication:', err);
        } finally {
            this._loading = false;
        }
    }

    private doRemoveTracking = async () => {
        try {
            this._loading = true;

            const result = await this.client.timeTracking.delete(this.entry.id);

            if (!result) {
                logger.error('Failed to delete tracking');
                return;
            }
        } catch (err) {
            logger.error('Unexpected error during tracking deletion:', err);
        } finally {
            this._loading = false;
        }
    }
}

export default class TimeTrackingViewModel {
    @observable
    private _error: string = null;

    @observable
    private _uploadProgress: number = null;

    @observable
    private _loading: boolean = false;

    @observable
    private _formatError: boolean = false;

    private readonly _disposer = new Unsubscriber();

    public readonly form = new TimeTrackingFormVM(this._clientGetter);

    constructor(private readonly _clientGetter: () => ClientModel) {}

    @computed
    get list(): ReadonlyArray<TimeTrackingListItem> {
        const timeTrackingEntries = this.model.timeTracking.entries;

        return timeTrackingEntries.map(e => new TimeTrackingListItem(e, this._clientGetter));
    }

    private get model() { return this._clientGetter(); }

    get formatError() { return this._formatError; }

    set formatError(val: boolean) { this._formatError = val; }

    get error() { return this._error || this.form.error; }

    get loading() { return this._loading || this.form.loading || this.list.some(doc => doc.loading); }

    get clientId() {
        return this.model.card.id;
    }

    get clientName() {
        return this.model.card.firstName && this.model.card.lastName
            ? `${this.model.card.firstName} ${this.model.card.lastName}`
            : null;
    }

    get uploadProgress() { return this._uploadProgress; }
    get inProgress() { return this.form.loading || (this.list.findIndex(s => s.loading) > -1); }

    public dispose() {
        this._disposer.dispose();
        this.form.dispose();
    }
}
