import { observable } from 'mobx';

export default class CheckboxViewModel {

    @observable
    private _isChecked: boolean = false;

    private readonly _defaultValue: boolean = false;

    constructor(defaultValue?: boolean) {
        if (defaultValue) {
            this._isChecked = defaultValue;
            this._defaultValue = defaultValue;
        }
    }

    get isChecked() {
        return this._isChecked;
    }

    set isChecked(value: boolean) {
        this._isChecked = value;
    }

    public toggleChecked() {
        this._isChecked = !this._isChecked;
    }

    reset() {
        this._isChecked = this._defaultValue;
    }
}
