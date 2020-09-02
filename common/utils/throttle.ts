import { safeCall } from './functions';

export class ThrottleAction<T = any> {

    private _timeoutRef: any = null;
    private _postponedCb: () => T = null;

    constructor(readonly timeout = 1000) {}

    clear() {
        clearTimeout(this._timeoutRef);
        this._timeoutRef = null;
        this._postponedCb = null;
    }

    tryRun(cb: () => T, restartTimeout = false) {
        if (!this._timeoutRef) {
            this._postponedCb = cb;
            this._timeoutRef = setTimeout(this.forceRun, this.timeout);
        } else if (restartTimeout) {
            this.clear();
            this.tryRun(cb);
        }
    }

    forceRun = () => {
        if (this._timeoutRef && this._postponedCb) {
            const cb = this._postponedCb;
            this.clear();
            return safeCall(cb);
        }
    }
}

export class ThrottleProcessor<TSubject> {

    private readonly _queue: TSubject[] = [];
    private readonly _action: ThrottleAction;

    constructor(readonly process: (objs: TSubject[]) => Promise<any>, timeout = 1000) {
        if (!process) {
            throw new Error('Arg0 expected: process');
        }

        this._action = new ThrottleAction(timeout);
    }

    push(data: TSubject) {
        this._queue.push(data);

        this._action.tryRun(this._process, true);
    }

    private _process = async () => {
        if (!this._queue.length) {
            return;
        }

        const objs = this._queue.slice();
        this._queue.length = 0;
        await this.process(objs);
    }

    clear() {
        this._action.clear();
    }
}
