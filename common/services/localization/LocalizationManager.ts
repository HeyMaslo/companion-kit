import { observable, transaction } from 'mobx';
import { StringsShape } from './defaultShape';
import createValidationErrorsStrings, { ValidationErrorsStrings } from './validationErrorsStrings';
import { ILocalization } from './ILocalization';
import { ValidationErrors } from 'common/utils/validation';

export { ILocalization };

export default class LocalizationManager<TLocaleType extends string, TStrings extends StringsShape> implements ILocalization<TStrings> {
    @observable
    private _currentLocale: TLocaleType;

    @observable.ref
    private _currentStrings: TStrings;

    @observable.ref
    private _validationErrors: ValidationErrorsStrings;

    private readonly _defaultStrings: TStrings;

    constructor(
        private readonly _dataSource: { [locale: string]: TStrings },
        initialLocale: TLocaleType,
        defaultLocale: TLocaleType = null,
    ) {
        this._defaultStrings = this.getStrings(defaultLocale || initialLocale);
        this.updateStrings(initialLocale);
    }

    get Locale() { return this._currentLocale; }

    get Current() { return this._currentStrings; }

    get ValidationErrors(): {[key in ValidationErrors]?: string } { return this._validationErrors; }

    updateStrings(locale: TLocaleType) {
        transaction(() => {
            this._currentLocale = locale;
            this._currentStrings = this.getStrings(this._currentLocale) || this._defaultStrings;
            this._validationErrors = createValidationErrorsStrings(this._currentStrings);
        });
    }

    private getStrings(locale: string): TStrings {
        return this._dataSource[locale];
    }
}

export type ILocalizationManager = LocalizationManager<string, StringsShape>;
