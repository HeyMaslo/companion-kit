import { observable } from 'mobx';

export default class RadioButtonViewModel {
    @observable
    private _checked: boolean = false;

    constructor(readonly _label: string) {}

    get checked() {
        return this._checked;
    }

    get label() {
        return this._label;
    }

    set checked(checked) {
        this._checked = checked;
    }
}
