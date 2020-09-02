import { observable, reaction } from 'mobx';
import { ValidatableViewModel, ValidationConfig } from './Validatable';

export class Select<T = any> extends ValidatableViewModel<T> {
    @observable
    private _index: number;

    @observable
    private _open: boolean;

    @observable.ref
    private _items: T[];

    @observable.ref
    private _values: string[] = [];

    private _accessor: (item: T) => string;

    constructor(items: T[], accessor: (item: T) => string, initialIndex: number = 0, validation?: ValidationConfig<T>) {
        super(validation);

        this._items = items;

        this._index = initialIndex;

        this._accessor = accessor;

        reaction(() => items, items2 => {
            this._values = items2.map(accessor);
        }, { fireImmediately: true });
    }

    protected get valueToValidate() { return this.selectedItem; }

    get open() {
        return this._open;
    }

    set items(items: T[]) {
        if (this._items.length !== items.length) {
            this._items = items;
            this._values = items.map(this._accessor);
        }
    }

    set open(value: boolean) {
        this._open = value;
    }

    // get converted to string values for options
    get values () {
        return this._values;
    }

    get items() {
        return this._items;
    }

    get selectedValue() {
        return this._values.length && this._index != null
            ? this._values[this._index]
            : null;
    }

    get selectedItem(): T {
        return this._index != null
            ? this._items[this._index]
            : null;
    }

    set selectedItem(item: T) {
        const index = this._items.indexOf(item);
        if (index >= 0) {
            this.index = index;
        }
    }

    // get and set selected index
    get index() {
        return this._index;
    }

    set index (val: number) {
        this._index = val;
    }

    reset = () => {
        this._index = 0;
    }
}

export class SelectString<T extends string = string> extends Select<T> {
    constructor(items: T[], initialIndex: number = 0, validation?: ValidationConfig<T>) {
        super(items, v => v, initialIndex, validation);
    }
}
