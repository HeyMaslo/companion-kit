import { observable, autorun } from 'mobx';
import logger from 'common/logger';
import { ValidatableViewModel, ValidationConfig } from './Validatable';

export type StringGetter = (() => string) | string;
export type FormatterHook = (newValue: string, prevValue?: string) => string;

export type TextConfig = {
    value: StringGetter,
    async?: boolean,
    noSubscribe?: boolean,
};

export type TextInputConfig = Partial<TextConfig> & {
    name?: StringGetter;
    title?: StringGetter;

    validation?: ValidationConfig;
    trimOnValidate?: boolean;

    formatterHook?: FormatterHook;
};

function FromGetter(getter: StringGetter, setter: (val: string) => void, autorunDelay: number = null, noAutorun: boolean = null) {
    if (typeof getter === 'function') {
        if (noAutorun) {
            setter(getter());
        } else {
            autorun(() => {
                setter(getter());
            }, { delay: autorunDelay });
            return true;
        }
    } else if (typeof getter === 'string') {
        setter(getter);
    }
    return false;
}

export class Text {
    @observable
    private _value: string;

    constructor(config: TextConfig) {
        FromGetter(config.value, val => this._value = val, config.async ? 100 : null, config.noSubscribe);
    }

    get value() { return this._value; }
}

export class TextInputVM extends ValidatableViewModel {
    @observable
    private _value = '';

    @observable
    private _focused = false;

    @observable
    private _name: string;

    @observable
    private _title: string;

    private readonly _valueObserving: boolean;
    private readonly _trimOnValidate: boolean;
    private readonly _formatterHook: FormatterHook;

    constructor(config?: TextInputConfig) {
        super(config?.validation);
        config = config || { value: '' };

        const delay = config.async ? 100 : null;

        FromGetter(config.name, val => this._name = val, delay);
        FromGetter(config.title, val => this._title = val, delay);
        this._valueObserving = FromGetter(config.value, val => this._value = val, delay);
        this._trimOnValidate = config?.trimOnValidate || false;
        this._formatterHook = config?.formatterHook || null;
    }

    get value() { return this._value; }
    get name() { return this._name; }
    get title() { return this._title; }

    set value(val) {
        if (!this._valueObserving) {
            this._value = this._formatterHook
                ? this._formatterHook(val, this._value)
                : val;
        } else {
            logger.warn('[TextInputViewModel] Setting value is not allowed when value is observing');
        }
    }

    get isEmpty() {
        return !this._value;
    }

    get focused() {
        return this._focused;
    }

    set focused(val) {
        this._focused = val;
        if (!val) {
            this.onBlur();
            return;
        }

        super.reset();
    }

    protected get valueToValidate() { return this.value; }

    private onBlur() {
        // TODO add option to disable this?
        // do not validate empty fields on blur
        if (this.value) {
            this.validate();
        }
    }

    validate() {
        if (!this._valueObserving && this._trimOnValidate) {
            this._value = (this._value || '').trim();
        }

        return super.validate();
    }

    reset() {
        this._value = '';
        this._focused = false;
        super.reset();
    }

}
