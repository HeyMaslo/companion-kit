
export class Pool<T> {

    private _container: T[] = [];

    constructor(private readonly factory: () => T) {

    }

    get(): T {
        if (this._container.length > 0) {
            return this._container.pop();
        } else {
            return this.factory();
        }
    }

    release(e: T): void;
    release(e: T[]): void;

    release(e: T | T[]) {
        if (Array.isArray(e)) {
            this._container.push(...e);
        } else {
            this._container.push(e);
        }
    }
}

export class CollectionPool<T, TData> {

    private _currentCollection: T[] = null;
    private readonly _pool: T[] = [];

    constructor(
        private readonly TFactory: new () => T,
        private readonly initializer: (obj: T, data: TData) => void,
        private readonly disposer: (obj: T) => void,
    ) {

    }

    public get currentCollection() { return this._currentCollection; }
    public get poolSize() { return this._pool.length; }

    map(source: ReadonlyArray<TData>) {
        this.cleanup();

        const collection: T[] = [];
        source.forEach(s => {
            let obj: T;
            if (this._pool.length > 0) {
                obj = this._pool.shift();
            } else {
                obj = new this.TFactory();
            }

            if (this.initializer) {
                this.initializer(obj, s);
            }

            collection.push(obj);
        });

        this._currentCollection = collection;
        return this._currentCollection;
    }

    cleanup() {
        if (this._currentCollection && this._currentCollection.length > 0) {
            if (this.disposer) {
                this._currentCollection.forEach(o => this.disposer(o));
            }
            this._pool.push(...this._currentCollection);
        }
    }
}
