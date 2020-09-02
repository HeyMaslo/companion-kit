import { IEvent, Event } from './event';

export type IntervalTimerEvent = {
    totalElapsed: number,
    ticks: number,
    started: Date,
};

export class IntervalTimer {

    private _dispose: any = null;
    private _state: IntervalTimerEvent = null;
    private _resolve: (e: IntervalTimerEvent) => void = null;

    private readonly _event = new Event<IntervalTimerEvent>();

    constructor(readonly interval: number) { }

    public get ticked(): IEvent<IntervalTimerEvent> { return this._event; }

    start() {
        this._state = { totalElapsed: 0, ticks: 0, started: new Date() };
        this._dispose = setInterval(this._onTick, this.interval);
    }

    awaitForNextTick(): Promise<IntervalTimerEvent> {
        return new Promise(resolve => {
            this._resolve = resolve;
        });
    }

    private _onTick = () => {
        const now = new Date();
        const msDiff = now.getTime() - this._state.started.getTime();
        this._state.totalElapsed += msDiff;
        this._state.ticks++;

        const e = {
            ...this._state,
            started: new Date(this._state.started),
        };

        this._event.trigger(e);

        this.resolveAwait(e);
    }

    private resolveAwait(e?: IntervalTimerEvent) {
        if (this._resolve) {
            const r = this._resolve;
            this._resolve = null;
            r(e);
        }
    }

    stop() {
        clearInterval(this._dispose);
        this.resolveAwait();
    }
}
