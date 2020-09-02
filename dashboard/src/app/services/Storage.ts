import IStorage, { IStorageSync } from 'common/abstractions/services/storage';

const Storage: IStorageSync = {
    getValue(key: string) {
        return window.localStorage.getItem(key);
    },

    setValue(key: string, value: string) {
        window.localStorage.setItem(key, value);
    },

    hasValue(key: string) {
        return window.localStorage.getItem(key) != null;
    },

    removeValue(key: string) {
        const hasValue = Storage.hasValue(key);
        if (!hasValue) {
            return false;
        }

        window.localStorage.removeItem(key);
        return true;
    },
};

export const StorageAsync: IStorage = {
    getValue(key: string) {
        return Promise.resolve(Storage.getValue(key));
    },

    setValue(key: string, value: string) {
        Storage.setValue(key, value);
        return Promise.resolve();
    },

    hasValue(key: string) {
        return Promise.resolve(Storage.hasValue(key));
    },

    remove(key: string) {
        Storage.removeValue(key);
        return Promise.resolve();
    },
};

export class KeyStorage {
    constructor(readonly key: string) { }

    get value() { return Storage.getValue(this.key); }
    set value(v: string) { Storage.setValue(this.key, v); }
}

export class KeyStorageConverted<T> {
    private readonly _storage: KeyStorage;

    constructor(
        key: string,
        readonly input: (v: T) => string,
        readonly output: (s: string) => T,
    ) {
        this._storage = new KeyStorage(key);
    }

    get value(): T { return this.output(this._storage.value); }
    set value(v: T) { this._storage.value = this.input(v); }
}

export default Storage;
