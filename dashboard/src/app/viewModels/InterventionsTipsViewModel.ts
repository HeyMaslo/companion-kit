import { computed, observable } from 'mobx';
import AppController from 'app/controllers';
import { TextInputVM } from 'common/viewModels';
import logger from 'common/logger';
import { Unsubscriber, IDisposable } from 'common/utils/unsubscriber';
import * as Validations from 'common/utils/validation';
import Localization from 'app/services/localization';
import { ValidatableViewModel } from 'common/viewModels';
import {
    InterventionTip,
    InterventionTipsStatuses,
    LabelType,
    TipsLabels,
} from 'common/models';
import { MultiselectViewModel } from 'common/viewModels/MultiselectViewModel';
import { IClientPromptsController } from 'app/controllers/Prompts.Client';

const EmptyLibraryTips: InterventionTip[] = [];

export class TipItemViewModel {
    @observable
    private _loading = false;

    constructor(
        public readonly entry: InterventionTip,
        private readonly clientTipsData: IClientPromptsController,
    ) {}

    get loading() { return this._loading; }
    get id() { return this.entry.id; }
    get text() { return this.entry.text; }

    @computed
    get status() {
        return InterventionTipsStatuses.Statuses.find(status => status.id === this.tipSettings?.status) || InterventionTipsStatuses.Statuses[0];
    }
    get labels() {return this.entry.labels; }
    get date() {
        if (!this.tipSettings?.date) {
            return null;
        }

        return this.tipSettings.date;
    }

    private get userPrompts() { return AppController.Instance.User.prompts; }

    public removeTip = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Are you sure?',
            message: 'Deleted tips can’t be restored.',
            confirmText: 'Delete',
            rejectText: 'Cancel',
            onConfirm: this.remove,
        });
    }

    private get tipSettings() {
        const tipsData = this.clientTipsData.state?.tipsData;
        return tipsData?.find(t => t.tipId === this.entry.id);
    }

    private remove = async () => {
        this._loading = true;

        try {
            await this.userPrompts.tips.delete(this.id);
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            this._loading = false;
        }
    }

    duplicate = async () => {
        this._loading = true;

        try {
            await this.userPrompts.tips.duplicate(this.id);
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            this._loading = false;
        }
    }
}

export default class InterventionsTipsViewModel implements IDisposable {
    private readonly _disposer: Unsubscriber = new Unsubscriber();

    readonly search = new TextInputVM({
        name: 'search',
    });

    public readonly tipForm = new TipsFormVM();

    @observable
    private _loading = false;

    constructor(
        private readonly _clientId: string,
    ) {}

    @computed
    get list(): ReadonlyArray<TipItemViewModel> {
        if (!this.client.card?.clientId) {
            return [];
        }

        const list = this.library.map(
            e => new TipItemViewModel(e, this.clientTipsData),
        );
        return list.filter(e => this.filterBySearchString(e.text, e.labels));
    }

    private get userTips() { return AppController.Instance.User.prompts; }
    private get clientTipsData() { return this.userTips.getClientState(this.client.card.clientId); }

    @computed
    private get library() { return this.userTips.library?.tips || EmptyLibraryTips; }

    get clientName() { return this.client.card.firstName && this.client.card.lastName ? `${this.client.card.firstName} ${this.client.card.lastName}` : null; }

    private get client() { return AppController.Instance.User.clients.getModel(this._clientId); }

    get loading() { return this._loading || this.tipForm.loading || this.list.some(item => item.loading); }

    private filterBySearchString(text: string, labels: TipsLabels[]) {
        if (!this.search.value) {
            return true;
        }
        const feelings = labels.map(l => TipsLabels.Strings[l]).join(', ');
        const inFeelings = feelings.toLowerCase().indexOf(this.search.value.toLowerCase()) >= 0;
        const inText = text.toLowerCase().indexOf(this.search.value.toLowerCase()) >= 0;

        return inText || inFeelings;
    }

    fillAddForm(entry: TipItemViewModel) {
        this.tipForm.tipId = entry.id;
        this.tipForm.text.value = entry.text;
        this.tipForm.mood.setSelected(entry.labels);
    }

    dispose() {
        this._disposer.dispose();
    }
}

export class TipsFormVM {
    @observable
    private _tipId: string = null;

    @observable
    private _error: string = null;

    @observable
    private _loading: boolean = false;

    get tipId() { return this._tipId; }

    set tipId(val: string) {
        this._tipId = val;
    }

    get error() { return this._error; }

    get loading() { return this._loading; }

    public readonly text = new TextInputVM({
        name: 'tipText',
        trimOnValidate: false,
        validation: {
            validator: val => Validations.Validators.textLength(val, 200),
            errors: Localization.ValidationErrors,
            accessor: error => error.replace('{length}', '200'),
        },
    });

    public readonly mood = new MultiselectViewModel<LabelType>(
        TipsLabels.Labels,
        p => p.value,
        [],
        {
            validator: Validations.Validators.notEmptyArray,
            errors: Localization.ValidationErrors,
        },
    );

    private addTip = async (): Promise<{ok: boolean}> => {
        this._error = null;

        if (await ValidatableViewModel.IsSomeInvalid([this.text, this.mood])) {
            return;
        }

        this._loading = true;

        try {
            await AppController.Instance.User.prompts.tips.add({
                id: null,
                labels: this.mood.selectedValues as TipsLabels[],
                text: this.text.value,
            });

            return {ok: true};
        } catch (err) {
            logger.warn('[ERROR]: ', err);
            this._error = err.message;

            return {ok: false};
        } finally {
            this._loading = false;
        }
    }

    private editTip = async (): Promise<{ok: boolean}> => {
        this._error = null;

        try {
            if (await ValidatableViewModel.IsSomeInvalid([this.text, this.mood])) {
                return;
            }
            this._loading = true;

            await AppController.Instance.User.prompts.tips.update( {
                id: this.tipId,
                labels: this.mood.selectedValues as TipsLabels[],
                text: this.text.value,
            });

            return {ok: true};
        } catch (err) {
            this._error = err.message;
            logger.error('Failed to edit prompt:', err);

            return {ok: false};
        } finally {
            this._loading = false;
        }
    }

    public submit = async () => {
        if (this.tipId) {
            const resp = await this.editTip();
            return resp.ok;
        }

        const res = await this.addTip();
        return res.ok;
    }

    public reset = () => {
        this.text.reset();
        this.mood.reset();
        this.tipId = null;
    }
}
