import { ValidationErrors } from './ValidationErrors';
import { ValidationError, ValidatorFunction, ValidatorFunctionAsync } from './types';

export { CreditCardValidations as CreditCard } from './creditCard';

export { ValidationErrors, ValidationError, ValidatorFunction, ValidatorFunctionAsync };

const RE = {
    // There is at least first and last name
    name: /^[a-z,\.'-]+( +[a-z,\.'-]+)+$/i,
    englishLetters: /^([a-zA-Z\s]+)$/,
    email: /^([a-zA-Z0-9_.-\\+])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/,

    // At least one English letter, (?=.*?[a-zA-Z])
    // -- At least one digit, (?=.*?[0-9])
    // -- At least one special character, (?=.*?[#?!@$%^&*-])
    // Minimum 6 in length .{6,} (with the anchors)
    password: /^(?=.*?[a-zA-Z0-9]).{6,}$/,

    // Valid URL
    url: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,

    zipcode: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
};

export const Validators = {

    none: <T = any>(val: T) => ValidationErrors.None,
    notEmpty: <T = string>(val: T) => !!val ? ValidationErrors.None : ValidationErrors.ShouldBeNonEmpty,

    firstName: <T = string>(val: T) => !!val ? ValidationErrors.None : ValidationErrors.FirstName,
    lastName: <T = string>(val: T) => !!val ? ValidationErrors.None : ValidationErrors.LastName,
    occupation: <T = string>(val: T) => !!val ? ValidationErrors.None : ValidationErrors.Occupation,
    birthday: (val: string | number | Date) =>
        !!val && new Date(val).getTime() < new Date().getTime() ? ValidationErrors.None : ValidationErrors.Birthday,
    relationship: <T = string>(val: T) => !!val ? ValidationErrors.None : ValidationErrors.Relationship,
    goal: <T = string>(val: T) => !!val ? ValidationErrors.None : ValidationErrors.Goal,

    fullName: (val: string) => RE.name.test(val.trim()) ? ValidationErrors.None : ValidationErrors.InvalidNameFormat,
    onlyEnglish: (val: string) => RE.englishLetters.test(val) ? ValidationErrors.None : ValidationErrors.OnlyEnglishLetters,
    email: (val: string) => RE.email.test(val) ? ValidationErrors.None : ValidationErrors.InvalidEmailFormat,
    password: (val: string) => RE.password.test(val) ? ValidationErrors.None : ValidationErrors.InvalidPasswordFormat,
    url: (val: string) => RE.url.test(val) ? ValidationErrors.None : ValidationErrors.InvalidURLFormat,

    notEmptyArray: <T>(val: T[]) => !!val && val.length ? ValidationErrors.None : ValidationErrors.ShouldBeNonEmpty,

    arrayContains: <T>(arr: T[]) => ((val: T) => arr.includes(val) ? ValidationErrors.None : ValidationErrors.ValueOutOfRange),

    notFutureDate: (val: string | number | Date) => {
        if (!val || isNaN(new Date(val).getTime())) {
            return ValidationErrors.InvalidDate;
        }

        return !!val && new Date(val).getTime() < new Date().getTime() ? ValidationErrors.None : ValidationErrors.NotFutureDate;
    },

    dateInFuture: (val: string | number | Date, withoutTime: boolean = true) => {
        const date = new Date(val).getTime();
        const now = new Date();
        if (!val || isNaN(date)) {
            return ValidationErrors.InvalidDate;
        }

        if (withoutTime) {
            now.setHours(0, 0, 0, 0);
        }

        return !!val && date >= now.getTime() ? ValidationErrors.None : ValidationErrors.FutureDate;
    },

    textLength: (val: string, length: number = 255, required: boolean = true) => {
        if ((!val || !val.replace(/\s/g, '').length) && required) {
            return ValidationErrors.ShouldBeNonEmpty;
        }

        if (val.length > length) {
            return ValidationErrors.TextLength;
        }
        return ValidationErrors.None;
    },

    maxIntegerValue: (val: string, max: number = 60) => {
        const value = parseInt(val, 10);

        if (!/^\+?(0|[1-9]\d*)$/.test(val)) {
            return ValidationErrors.InvalidInteger;
        }

        if (!value) {
            return ValidationErrors.ShouldBeNonEmpty;
        }

        return value <= max ? ValidationErrors.None : ValidationErrors.MaxValue;
    },

    zipcode: (val: string) => RE.zipcode.test(val) ? ValidationErrors.None : ValidationErrors.Zipcode,
};

const isDocNameValid = (name: string) => {
    if (!name || !name.replace(/\s/g, '').length) {
        return ValidationErrors.ShouldBeNonEmpty;
    }

    if (name.length > 255) {
        return ValidationErrors.None;
    }
    return ValidationErrors.None;
};

export function createShouldBeEqualTo<T = string>(getter: () => T): ValidatorFunction<T> {
    return (val: T) => getter() === val ? ValidationErrors.None : ValidationErrors.ShouldBeEqualTo;
}

export const Wrappers = {
    required<T = string>(validator: ValidatorFunction<T>): ValidatorFunction<T> {
        return (val: T): ValidationErrors => {
            return Validators.notEmpty(val) || validator(val);
        };
    },

    notRequired<T = string>(validator: ValidatorFunction<T>): ValidatorFunction<T> {
        return (val: T): ValidationErrors => {
            return Validators.notEmpty(val) === ValidationErrors.ShouldBeNonEmpty
                ? ValidationErrors.None
                : validator(val);
        };
    },

    thrower<T = string>(validator: ValidatorFunction<T>) {
        return (val: T) => {
            throwNotOk(validator(val));
        };
    },

    getter<T, TField extends keyof T>(field: TField, fn: ValidatorFunction<T[TField]>): ValidatorFunction<T> {
        return (val: T) => {
            const f = val && val[field];
            return fn(f);
        };
    },
};

export function throwNotOk(result: ValidationErrors, message = 'Validation error') {
    if (result) {
        throw new ValidationError(message, result);
    }
}

export function validateObject<T>(
    obj: T,
    validators: { [P in keyof T]?: ValidatorFunction<T[P]> },
    atLeastOneValidField = false,
): { [P in keyof T]?: ValidationErrors } {

    const res: { [P in keyof T]?: ValidationErrors } = { };

    const keys = Object.keys(obj);
    let hasValidField = false;
    for (let i = 0; i < keys.length; ++i) {
        const k = keys[i];
        const kk = k as keyof T;
        const validator: ValidatorFunction<T[typeof kk]> = validators[kk];
        if (!validator) {
            continue;
        }

        const v = obj[k as keyof T];
        const err = validator(v);
        if (err) {
            res[kk] = err;
        } else {
            hasValidField = true;
        }
    }

    if (atLeastOneValidField && hasValidField) {
        return { };
    }

    return res;
}
