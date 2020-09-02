import { observable } from 'mobx';
import { ValidatorFunction, ValidatorFunctionAsync, ValidationErrors, ValidationError } from 'common/utils/validation';

export type ValueValidator<T = string> = ValidatorFunction<T> | ValidatorFunctionAsync<T>;
export type ValidationErrorsStrings = { [code: number]: string };

export type ValidationConfig<T = string> = {
    validator: ValueValidator<T>,
    errors: ValidationErrorsStrings | (() => ValidationErrorsStrings),
    accessor?: (error: string) => string,
};

export interface IValidatable {
    readonly isValid: boolean;
    readonly error: string;

    validate(): Promise<boolean>;
    resetError(): void;
}

export interface IResetable {
    reset(): void;
}

const NoValidator = () => ValidationErrors.None;

export abstract class ValidatableViewModel<T = string> implements IValidatable, IResetable {

    private readonly _config: ValidationConfig<T>;

    @observable
    private _error: string;

    private _validationError: ValidationError;

    constructor(config?: ValidationConfig<T>) {
        this._config = { ...config };
    }

    protected abstract get valueToValidate(): T;

    get isValid() { return !this._error; }

    get error() { return this._error; }

    async validate() {
        if (!this._config.validator) {
            return true;
        }

        try {
            const valid = await this._config.validator(this.valueToValidate);
            this._validationError = valid === ValidationErrors.None
                ? null
                : new ValidationError('Unknown error', valid);
        } catch (err) {
            this._validationError = err as ValidationError;
        }

        if (!this._validationError) {
            this._error = null;
        } else {
            const code = this._validationError.code;
            const errors = (typeof this._config?.errors === 'function'
                ? this._config?.errors()
                : this._config?.errors) || { };
            this._error = this._config?.accessor ? this._config?.accessor(errors[code]) : errors[code];
        }
        return this._validationError == null;
    }

    resetError() {
        this._validationError = null;
        this._error = null;
    }

    reset() {
        this.resetError();
    }

    static async IsSomeInvalid(validatables: IValidatable[], stopOnFail = true, resetErrors = true) {
        if (resetErrors) {
            validatables.forEach(v => v?.resetError());
        }

        if (stopOnFail) {
            return validatables.someAsync(async v => !!v ? !(await v.validate()) : false);
        }

        const results = await Promise.all(validatables.map(v => v?.validate()));
        return results.some(r => r === false);
    }
}
