import { computed, observable, reaction } from 'mobx';
import { DateViewModel, Select, TextInputVM, ValidatableViewModel } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from 'app/services/localization';
import logger from 'common/logger';
import { TimeTrackingActivities } from 'common/models/TimeTracking';
import { ClientModel } from 'app/controllers/ClientModel';
import CheckboxViewModel from 'app/viewModels/components/CheckboxViewModel';
import { TimeTrackingListItem } from 'app/viewModels/TimeTracking/TimeTrackingViewModel';
import { Unsubscriber } from 'common/utils/unsubscriber';

export class TimeTrackingFormVM {
    @observable
    private _id: string = null;

    @observable
    private _error: string = null;

    @observable
    private _loading: boolean = false;

    @observable
    private _diagnosisIndex: number = null;

    private readonly _disposer = new Unsubscriber();

    constructor(private readonly _clientGetter: () => ClientModel) {
        this._disposer.add(reaction(() => this.diagnosisList, list => {
            this.diagnosis.items = list;
        }));
    }

    get id() { return this._id; }

    set id(val: string) {
        this._id = val;
    }

    get error() { return this._error; }

    get loading() { return this._loading; }

    get model() { return this._clientGetter(); }

    public readonly date = new DateViewModel({
        validation: {
            validator: Validations.Validators.notFutureDate,
            errors: Localization.ValidationErrors,
        },
        default: new Date(),
    });

    public readonly activity = new Select<TimeTrackingActivities>(
        TimeTrackingActivities.All,
        p => p,
    );

    public readonly diagnosis = new Select(
        this.diagnosisList,
        p => p,
        null,
    );

    public readonly minutes = new TextInputVM({
        name: 'minutes',
        trimOnValidate: false,
        value: '15',
        validation: {
            validator: Validations.Validators.maxIntegerValue,
            errors: Localization.ValidationErrors,
            accessor: error => error.replace('{max}', '60'),
        },
    });

    public readonly notes = new TextInputVM({
        name: 'notes',
        trimOnValidate: false,
        validation: {
            validator: val => Validations.Validators.textLength(val, 500, false),
            errors: Localization.ValidationErrors,
            accessor: error => error.replace('{length}', '500'),
        },
    });

    public readonly billable = new CheckboxViewModel(true);

    @computed
    public get diagnosisList() {
        const diagnosis = this.model?.card?.diagnosis;
        return diagnosis?.length ? this.model.card.diagnosis.filter(d => !!d) : [];
    }

    private addTimeTracking = async (): Promise<{ok: boolean}> => {
        this._error = null;

        if (await ValidatableViewModel.IsSomeInvalid([this.date, this.activity, this.diagnosis, this.notes, this.minutes])) {
            return;
        }

        this._loading = true;

        try {
           await this.model.timeTracking.create({
                id: null,
                date: this.date.value.getTime(),
                activity: this.activity.selectedItem,
                diagnosis: this.diagnosis.selectedItem,
                minutes: parseInt(this.minutes.value, 10),
                notes: this.notes.value,
                billable: this.billable.isChecked,
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

    private editTimeTracking = async (): Promise<{ok: boolean}> => {
        this._error = null;

        try {
            if (await ValidatableViewModel.IsSomeInvalid([this.date, this.activity, this.diagnosis, this.notes, this.minutes])) {
                return;
            }
            this._loading = true;

            await this.model.timeTracking.update({
                id: this.id,
                date: this.date.value.getTime(),
                activity: this.activity.selectedItem,
                minutes: parseInt(this.minutes.value, 10),
                notes: this.notes.value,
                billable: this.billable.isChecked,
            });

            return {ok: true};
        } catch (err) {
            this._error = err.message;
            logger.error('Failed to edit time tracking:', err);

            return {ok: false};
        } finally {
            this._loading = false;
        }
    }

    public submit = async () => {
        if (this.id) {
            const resp = await this.editTimeTracking();
            return resp.ok;
        }

        const res = await this.addTimeTracking();
        return res.ok;
    }

    public fillForm = (entry: TimeTrackingListItem) => {
        if (entry.diagnosis) {
            this.diagnosis.items = [entry.diagnosis];
        }
        const diagnosisIndex = this.diagnosis.values.indexOf(entry.diagnosis);

        this.date.value = new Date(entry.date);
        this.activity.index = this.activity.values.indexOf(entry.activity);
        this.diagnosis.index = diagnosisIndex > -1 ? diagnosisIndex : null;
        this.minutes.value = entry.time.toString();
        this.notes.value = entry.notes;
        this.billable.isChecked = entry.billable === 'Yes';
        this.id = entry.id;
    }

    public reset = () => {
        this.date.reset();
        this.activity.reset();
        this.minutes.reset();
        this.notes.reset();
        this.billable.reset();
        this.id = null;

        this.diagnosis.index = null;
        this.diagnosis.items = this.diagnosisList;
    }

    public dispose() {
        this._disposer.dispose();
    }
}
