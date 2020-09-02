import { observable, autorun} from 'mobx';

export default class DropdownViewModel<T = any> {

    @observable
    _open: boolean = false;

    get open() {
        return this._open;
    }

    set open(value: boolean) {
        this._open = value;
    }

}
