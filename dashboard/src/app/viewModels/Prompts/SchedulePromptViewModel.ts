import { computed, observable } from 'mobx';
import AppController from 'app/controllers';
import { ClientModel } from 'app/controllers/ClientModel';
import { AppPromptsCategories, PromptType } from 'common/models/prompts';
import logger from 'common/logger';
import { DateViewModel, ValidatableViewModel } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from 'app/services/localization';
import { AnyEvent, EventIded, EventTypes, PromptEventIded } from 'common/models/Events';
import { formatFullDate, timestampToTime } from 'common/utils/dateHelpers';
import { groupBy } from 'common/utils/mathx';

export class ScheduleItemViewModel {
    @observable
    private _loading = false;

    constructor(
        public readonly entry: PromptEventIded,
        private readonly prompt: PromptType,
        private readonly _clientGetter: () => ClientModel = () => null,
    ) {
        if (!entry || !prompt) {
            throw new Error('ScheduleItemViewModel: cannot initialize without entry or type');
        }
    }

    get loading() { return this._loading; }

    get timestamp() { return this.entry.timestamp; }
    get date() { return formatFullDate(this.entry.timestamp); }
    get time() { return timestampToTime(this.entry.timestamp); }

    get text() { return this.prompt?.text; }
    get id() { return this.entry.id; }
    get promptId() { return AnyEvent.isPrompt(this.entry) ? this.entry.promptId : null; }
    get category() {
        return AppPromptsCategories.Categories.find(cat => {
            if (AnyEvent.isPrompt(this.entry)) {
                return cat.id === this.prompt?.categoryId;
            }

            return false;
        });
    }

    private get model() { return this._clientGetter(); }

    public unschedulePrompt = () => {
        AppController.Instance.PromptModal.openModal({
            typeModal: 'negative',
            title: 'Are you sure?',
            message: 'Do you really want to unschedule this prompt?',
            confirmText: 'unschedule',
            rejectText: 'Cancel',
            onConfirm: this.unschedule,
        });
    }

    unschedule = async () => {
        this._loading = true;

        try {
            logger.log('Unschedule request');
            await this.model.events.edit.delete(this.entry.id);
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            this._loading = false;
        }
    }

    duplicate = async () => {
        this._loading = true;

        try {
            logger.log('Duplicate request');
            await this.model.events.edit.duplicate(this.entry.id);
        } catch (e) {
            logger.warn('Error: ', e);
        } finally {
            this._loading = false;
        }
    }
}

export default class ScheduleViewModel {
    public readonly scheduleForm = new ScheduleFormViewModel(this.model);

    constructor(
        private readonly _clientGetter: () => ClientModel,
    ) {}

    private get model() { return this._clientGetter(); }
    get loading() { return this.scheduleForm.loading; }

    private get userPrompts() { return AppController.Instance.User.prompts; }

    private get libraryPrompts() { return this.userPrompts.library?.types; }

    @computed
    private get targetEvents(): PromptEventIded[] {
        return this.model.events.entries
            // TODO show events with errors, or with other status
            .filter(e => AnyEvent.isPrompt(e) && !e.triggered && e.promptId)
            .sort((e1, e2) => e1.timestamp - e2.timestamp) as PromptEventIded[];
    }

    @computed
    private get itemsList(): ReadonlyArray<ScheduleItemViewModel> {
        const list = this.targetEvents
            .map(e => {
                const prompt = this.libraryPrompts?.find(p => p.id === e.promptId);
                if (!prompt) {
                    return null;
                }
                return new ScheduleItemViewModel(e, prompt, () => this.model);
            }).filter(i => i);

        return list;
    }

    @computed
    get list(): Array<{date: string, items: ReadonlyArray<ScheduleItemViewModel>}> {
        const grouped = groupBy(this.itemsList, i => i.date);

        return Object.keys(grouped).map((date: string) => ({
            date,
            items: grouped[date],
        }));
    }

    fillAddForm(entry: ScheduleItemViewModel) {
        const dateValue = new Date(entry.timestamp);

        this.scheduleForm.eventId = entry.id;
        this.scheduleForm.promptId = entry.promptId;
        this.scheduleForm.eventText = entry.text;
        this.scheduleForm.time.value = dateValue;
        this.scheduleForm.date.value = dateValue;
    }
}

export class ScheduleFormViewModel {
    @observable
    private _eventId: string = null;

    @observable
    private _promptId: string = null;

    @observable
    private _eventText: string = null;

    @observable
    private _error: string = null;

    @observable
    private _loading: boolean = false;

    public readonly date = new DateViewModel({
        validation: {
            validator: Validations.Validators.dateInFuture,
            errors: Localization.ValidationErrors,
        },
    });

    public readonly time = new DateViewModel({
        validation: {
            validator: val => {
                if (process.env.NODE_ENV !== 'production') {
                    return Validations.Validators.dateInFuture(val, false);
                } else {
                    return Validations.Validators.notEmpty(val);
                }
            },
            errors: Localization.ValidationErrors,
        },
    });

    constructor(private readonly client: ClientModel) {}

    get eventId() { return this._eventId; }

    set eventId(val: string) {
        this._eventId = val;
    }

    get eventText() { return this._eventText; }

    set eventText(val: string) {
        this._eventText = val;
    }

    get promptId() { return this._promptId; }

    set promptId(val: string) {
        this._promptId = val;
    }

    get error() { return this._error; }

    get loading() { return this._loading; }

    private get userPrompts() { return AppController.Instance.User.prompts; }
    private get clientPromptsController() { return this.userPrompts?.getClientState(this.client.card.clientId); }

    public submit = async () => {
        this._error = null;

        if (await ValidatableViewModel.IsSomeInvalid([this.date, this.time])) {
            return;
        }

        this._loading = true;

        try {
            const date = this.date.value;
            const time = this.time.value;

            date.setHours(time.getHours(), time.getMinutes());

            if (this.eventId) {
                const event = {
                    id: this.eventId,
                    timestamp: date.getTime(),
                    type: EventTypes.Prompt,
                    text: this.eventText,
                    // event meta
                    promptId: this.promptId,
                } as EventIded;

                await this.client.events.edit.update(event);
            } else {
                const event = {
                    timestamp: date.getTime(),
                    type: EventTypes.Prompt,
                    text: this.eventText,
                    // event meta
                    promptId: this.promptId,
                } as AnyEvent;

                await this.client.events.edit.add(event);
            }

            await this.clientPromptsController.prompts.setIsActive({ [this.promptId]: true });

            return {ok: true};
        } catch (err) {
            logger.warn('[ERROR]: ', err);
            this._error = err.message;

            return {ok: false};
        } finally {
            this._loading = false;
        }
    }

    public reset = () => {
        this.date.reset();
        this.time.reset();
        this.date.value = null;
        this.time.value = null;
        this.eventId = null;
        this.promptId = null;
        this.eventText = null;
    }

    public fillForm = (entry: ScheduleItemViewModel) => {
        this.date.value = new Date(entry.timestamp);
        this.time.value = new Date(entry.timestamp);
        this.eventId = entry.id;
        this.promptId = entry.promptId;
        this.eventText = entry.text;
    }
}
