import { observable } from 'mobx';

export class TimeObservable {
    @observable.ref
    private _now: Date = new Date();

    private _disposer: any;

    constructor(intervalMs = 1000) {
        this._disposer = setInterval(() => {
            this._now = new Date();
        }, intervalMs);
    }

    get now() {
        return this._now;
    }

    get nowMs() {
        return this.now.getTime();
    }

    get nowSec() {
        return this.nowMs / 1000;
    }

    dispose() {
        clearInterval(this._disposer);
    }
}
