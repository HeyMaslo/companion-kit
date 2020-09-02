
export type LazyLight<T> = {
    readonly value: T;
    readonly hasValue: boolean;

    reset(): void;
};

export function createLazy<T>(factory: () => T) {
    return {
        _factory: factory,
        _instance: undefined as T,
        get value() {
            if (this._instance === undefined) {
                this._instance = this._factory();
            }
            return this._instance;
        },
        get hasValue() { return this._instance !== undefined; },
        reset() {
            this._instance = undefined;
        },

    } as LazyLight<T>;
}
