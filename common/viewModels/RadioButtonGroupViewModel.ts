import { observable } from 'mobx';
import RadioButtonViewModel from 'common/viewModels/RadioButtonViewModel';

export class RadioButtonGroup {
    @observable
    private _items: RadioButtonViewModel[] = [];

    constructor(items: string[]) {
        items.forEach(item => {
            this._items.push(new RadioButtonViewModel(item));
        });

        this.setDefaultChecked();
    }

    onSelect = (label: string) => {
        this._items.forEach(item => {
            const checked = item.label === label;
            item.checked = checked;
        });
    }

    setDefaultChecked() {
        this._items.forEach((item, index) => {
            if (item.label === 'ALL' || index === 0) {
                item.checked = true;
            }
        });
    }

    get items() {
        return this._items;
    }

    get activeRadioButton() {
        let activeButton: RadioButtonViewModel = null;

        this._items.forEach(item => {
            if (item.checked) {
                activeButton = item;
            }
        });
        return activeButton;
    }
}
