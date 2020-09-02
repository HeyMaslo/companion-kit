import logger from 'common/logger';

export interface IDisposable {
    dispose(): void;
}

export interface Disposer {
    (): void;
}

export class Unsubscriber {

    private readonly _disposers: Disposer[] = [];
    private readonly _map =  new Map<string, Disposer>();

    constructor(readonly logName: string = null) { }

    add(d: Disposer | IDisposable, id?: string) {
        if (!d) {
            return;
        }

        const dd: Disposer = typeof d !== 'function'
            ? (() => d.dispose ? d.dispose() : null)
            : d;

        this._disposers.push(dd);

        if (id) {
            // dispose previous identified disposer
            if (this._map.has(id)) {
                this.execute(id);
            }

            this._map.set(id, dd);
        }
    }

    execute(id: string) {
        const d = this._map.get(id);
        if (!d) {
            return;
        }

        this._map.delete(id);
        const i = this._disposers.indexOf(d);
        if (i >= 0) {
            this._disposers.splice(i, 1);
        }

        d();
    }

    dispose(log = false) {
        if (log) {
            logger.log(
                `[Disposer:${this.logName || '<unknown>'}] Disposing ${this._disposers.length} items including named ones:`,
                Array.from(this._map.entries()).map(e => e[0]),
            );
        }

        this._disposers.forEach(d => d());
        this._disposers.length = 0;
        this._map.clear();
    }
}
