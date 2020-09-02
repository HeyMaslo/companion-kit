import { observable, reaction } from 'mobx';
import { ValidatableViewModel, ValidationConfig } from './Validatable';
import { LabelType } from 'common/models';

type StringOrNumber = string | number;

export class MultiselectViewModel<T extends LabelType = LabelType> extends ValidatableViewModel<T[]> {
    @observable
    private _selected: T[];

    // @observable
    // private _open: boolean;

    @observable.ref
    private _items: T[];

    @observable.ref
    private _values: StringOrNumber[] = [];

    constructor(items: T[], accessor: (item: T) => StringOrNumber, defaults: StringOrNumber[], validation?: ValidationConfig<T[]>) {
        super(validation);
        if (!items?.length) {
            throw new Error('MultiSelect: items must be not empty');
        }

        this._items = items;

        this._selected = items.filter(i => defaults.includes(i.value));

        reaction(() => items, items2 => {
            this._values = items2.map(accessor);
        }, { fireImmediately: true });
    }

    protected get valueToValidate() { return this._selected; }

    // get open() {
    //     return this._open;
    // }

    set items(items: T[]) {
        if (this._items.length !== items.length) {
            this._items = items;
        }
    }

    // set open(value: boolean) {
    //     this._open = value;
    // }

    // get converted to string values for options
    get values () {
        return this._values;
    }

    get items() {
        return this._items;
    }

    get selectedValues() {
        return this._selected?.map(i => i.value.toString());
    }

    get selectedItems(): T[] {
        return this._selected;
    }

    set selectedItems(items: T[]) {
        this._selected = items;
    }

    setSelected(values: StringOrNumber[]) {
        this._selected = this.items.filter(i => values.includes(i.value));
    }

    reset = () => {
        this._selected = [];
    }
}
