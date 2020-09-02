import { observable } from 'mobx';

export default class Lazy<T> {

    @observable.ref
    private _instance: T;

    constructor(private _factory: (() => T)) {
    }

    get hasValue() { return this._instance != null; }

    get weakValue() { return this._instance; }

    get value() {
        if (!this._instance) {
            this._instance = this._factory();
        }
        return this._instance;
    }

    prewarm() {
        return this.value;
    }

    reset() {
        this._instance = null;
    }
}
