import { AsYouType, CountryCode, PhoneNumber } from 'libphonenumber-js';
import { ValidationErrors } from './ValidationErrors';
import { ValidatorFunction } from './types';

export { CountryCode };

export class PhoneValidator {
    private _currentNumber: PhoneNumber;
    private _currentFormatted: string;
    private readonly _asYouType: AsYouType;

    public readonly validator: ValidatorFunction;

    static Validate(phoneNumber: string, supportedCountries: CountryCode[] = ['US']): ValidationErrors {
        const pn = new PhoneValidator(supportedCountries);
        pn.setValue(phoneNumber);
        return pn.validationError;
    }

    constructor(readonly supportedCountries: CountryCode[] = ['US'], defaultCountry: CountryCode = 'US') {
        this.validator = (val: string) => {
            this.setValue(val);
            return this.validationError;
        };
        this._asYouType = new AsYouType(defaultCountry);
    }

    setValue(v: string) {
        let vv = v || '';
        if (this.value === v) {
            return this.value;
        }

        // trying to catch a case when using backspace and erasing last '(' in '(xxx)' formatted value
        if (vv.length < this.value.length && vv.includes('(') && !vv.includes(')')) {
            vv = vv.substring(0, vv.length - 1); // strip out the last char
        }

        this._asYouType.reset();

        this._currentFormatted = this._asYouType.input(vv);
        this._currentNumber = this._asYouType.getNumber();
        return this.value;
    }

    get template() { return this._asYouType.getTemplate(); }

    get value() { return this._currentFormatted || ''; }

    get isValidCountry() {
        return this.supportedCountries
            ? this._currentFormatted && this._currentNumber && this.supportedCountries.includes(this._currentNumber.country)
            : true;
    }

    get isValid() {
        return this._currentNumber && this._currentNumber.isPossible();
    }

    get validationError() {
        if (!this.isValid) {
            return ValidationErrors.InvalidPhoneFormat;
        }

        if (!this.isValidCountry) {
            return ValidationErrors.InvalidPhoneCountry;
        }

        return ValidationErrors.None;
    }
}
