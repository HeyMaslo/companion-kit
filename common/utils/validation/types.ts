import { ValidationErrors } from './ValidationErrors';

export type ValidatorFunction<T = string> = (val: T) => ValidationErrors;
export type ValidatorFunctionAsync<T = string> = (val: T) => Promise<ValidationErrors>;

export type WrapperFunction = (val: ValidatorFunction) => ValidatorFunction;

export class ValidationError extends Error {
    readonly code: ValidationErrors;

    constructor(message: string, code: ValidationErrors) {
        super(message);
        this.code = code;
    }
}
