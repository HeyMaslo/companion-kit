import { observable } from 'mobx';

export default class TabsViewModel {
    @observable
    private _selectedIndex: number = 0;

    constructor(initialIndex = 0) {
        this._selectedIndex = initialIndex;
    }

    get selectedIndex() { return this._selectedIndex; }

    set selectedIndex(index: number) {
        this._selectedIndex = index;
    }
}
