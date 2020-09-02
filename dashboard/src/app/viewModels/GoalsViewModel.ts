import { observable, computed } from 'mobx';
import { IDisposable } from 'common/utils/unsubscriber';
import { GoalType, GoalStatus } from 'common/models';
import AppController from 'app/controllers';
import { TextInputVM } from 'common/viewModels';
import { IClientPromptsController } from 'app/controllers/Prompts.Client';
import * as Validations from 'common/utils/validation';
import Localization from 'app/services/localization';
import { ValidatableViewModel } from 'common/viewModels';
import logger from 'common/logger';
import { ClientModel } from 'app/controllers/ClientModel';

export class GoalItemViewModel {
    @observable
    private _loading = false;

    constructor(
        readonly entry: GoalType,
        readonly clientState: IClientPromptsController,
    ) {}

    get loading() { return this._loading; }
    get id() { return this.entry.id; }
    get text() { return this.entry.text; }

    @computed
    private get goalState() { return this.clientState.goals?.getState(this.entry.id); }

    get dateCreated() {
        return this.entry.date;
    }

    get dateCompleted() {
        return this.goalState?.status === GoalStatus.Completed
            ? this.goalState.date
            : null;
    }

    get status() { return this.goalState?.status; }
    get isCompleted() { return this.status === GoalStatus.Completed; }

    duplicate = async () => {
        this._loading = true;

        try {
            await this.clientState.goals.library.duplicate(this.id);
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            this._loading = false;
        }
    }

    remove = async () => {
        this._loading = true;

        try {
            await this.clientState.goals.library.delete(this.id);
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            this._loading = false;
        }
    }

    toggleCompleted = async () => {
        const nextStatus = this.status === GoalStatus.Completed
            ? GoalStatus.Incomplete
            : GoalStatus.Completed;

        this.clientState.goals.setStatus(this.id, nextStatus);
    }
}

const EmptyLibrary: GoalType[] = [];

export default class GoalsViewModel implements IDisposable {

    @observable
    private _loading = false;

    readonly search = new TextInputVM({
        name: 'search',
    });

    public readonly editModal = new GoalEditModalVM(() => this.clientState);

    constructor(
        private readonly _clientGetter: () => ClientModel,
    ) {
    }

    get loading() { return this._loading || this.editModal.loading || this.list.some(item => item.loading); }

    private get clientModel() { return this._clientGetter(); }

    private get library() {
        return this.clientState?.goals?.types || EmptyLibrary;
    }

    @computed
    private get clientState() { return AppController.Instance.User.prompts.getClientState(this.clientModel.card?.clientId); }

    @computed
    private get rawList(): ReadonlyArray<GoalItemViewModel> {
        if (!this.clientModel.card?.clientId) {
            return [];
        }

        const clientState = this.clientState;
        const list = this.library.map(
            e => new GoalItemViewModel(e, clientState),
        );
        return list;
    }

    @computed
    get list(): ReadonlyArray<GoalItemViewModel> {
        return this.search.value
            ? this.rawList.filter(e => e.text.includes(this.search.value))
            : this.rawList;
    }

    dispose() {
        /* no-op */
    }
}

export class GoalEditModalVM {

    private _tipId: string;

    @observable
    private _error: string = null;

    @observable
    private _loading: boolean = false;

    public readonly text = new TextInputVM({
        name: 'tipText',
        trimOnValidate: false,
        validation: {
            validator: val => Validations.Validators.textLength(val, 200),
            errors: Localization.ValidationErrors,
            accessor: error => error.replace('{length}', '200'),
        },
    });

    constructor(readonly _clientStateGetter: () => IClientPromptsController) { }

    get error() { return this._error; }
    get loading() { return this._loading; }

    public setItem = (item: GoalItemViewModel) => {
        this._tipId = item.id;
        this.text.value = item.text;
    }

    public submit = async () => {
        this._error = null;

        try {
            if (await ValidatableViewModel.IsSomeInvalid([this.text])) {
                return;
            }

            this._loading = true;

            if (!this._tipId) {
                await this._clientStateGetter().goals.library.add({
                    id: null,
                    text: this.text.value,
                });
            } else {
                await this._clientStateGetter().goals.library.update( {
                    id: this._tipId,
                    text: this.text.value,
                });
            }

            return { ok: true };
        } catch (err) {
            logger.warn('[ERROR]: ', err);
            this._error = err.message;

            return { ok: false };
        } finally {
            this._loading = false;
        }
    }

    public reset = () => {
        this.text.reset();
        this._tipId = null;
    }
}
