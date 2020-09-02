import { observable } from 'mobx';
import * as DateHelpers from 'common/utils/dateHelpers';
import { ValidatableViewModel, ValidationConfig } from './Validatable';

type DateViewModelConfig = {
    validation?: ValidationConfig<Date>,
    default?: Date,
    constraits?: {
        min?: () => Date,
        max?: () => Date,
    },
};

export class DateViewModel extends ValidatableViewModel<Date> {

    @observable
    private _value: Date = null;

    private readonly _default: Date = null;
    private readonly _constraints: DateViewModelConfig['constraits'];

    constructor(config?: DateViewModelConfig) {
        super(config?.validation);

        if (config?.default) {
            this._value = config.default;
            this._default = config.default;
        }

        if (config?.constraits) {
            this._constraints = config.constraits;
        }
    }

    get value() { return this._value; }
    set value(v: Date) {
        this.resetError();
        this._value = this._constrain(v);
    }

    private _constrain(v: Date): Date {
        let result = v;
        const min = this._constraints?.min && this._constraints.min();
        if (min) {
            result = DateHelpers.max(min, result);
        }

        const max = this._constraints?.max && this._constraints.max();
        if (max) {
            result = DateHelpers.min(max, result);
        }
        return result;
    }

    reset() {
        super.reset();
        this.value = this._default;
    }

    protected get valueToValidate() { return this._value; }
}
