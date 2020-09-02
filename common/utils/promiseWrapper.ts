
export class PromiseWrapper<T = void> {

    private _promise: Promise<T>;

    private _resolve: (res: T) => void;
    private _reject: (err?: any) => void;

    public get promise() { return this._promise; }
    public get isRunning() { return !!this._promise; }

    begin(): Promise<T> {
        if (this._promise) {
            throw new Error('Already started');
        }

        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        return this._promise;
    }

    resolve(res: T) {
        if (!this._resolve || !this._reject) {
            if (!this._promise) {
                const msg = 'Promise has not started, nothing to resolve!';
                console.error(msg);
                throw new Error(msg);
            } else {
                return;
            }
        }

        try {
            this._resolve(res);
        } catch (err) {
            this._reject(err);
        } finally {
            this._clear();
        }
    }

    error(reason?: any) {
        if (!this._resolve || !this._reject) {
            if (!this._promise) {
                throw new Error('Has not started');
            } else {
                return;
            }
        }

        this._reject(reason);
        this._clear();
    }

    private _clear() {
        this._resolve = null;
        this._reject = null;
    }
}