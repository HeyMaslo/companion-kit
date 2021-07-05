import IStorage from 'common/abstractions/services/storage';
import { AsyncStorage } from 'react-native';

const StorageAsync: IStorage = {
    getValue(key: string): Promise<string> {
        return AsyncStorage.getItem(key);
    },

    setValue(key: string, value: string): Promise<void> {
        if (!key) {
            throw new Error('[StorageAsync] key must be not empty! got:' + key);
        }
        if (!value) {
            throw new Error(
                "[StorageAsync] value must be not null! use 'remove' instead. Got: " +
                    `${key} | ${value}`,
            );
        }

        return AsyncStorage.setItem(key, value);
    },

    async hasValue(key: string): Promise<boolean> {
        try {
            const value = await StorageAsync.getValue(key);
            return !!value;
        } catch (err) {
            return false;
        }
    },

    remove(key: string): Promise<void> {
        return AsyncStorage.removeItem(key);
    },
};

export class StorageEntryAsync {
    private readonly _key: string;

    private _cachedValue: string;
    private _disableCache: boolean;

    constructor(key: string, disableCache?: boolean) {
        this._key = key;
        this._disableCache = disableCache;
    }

    getAsync(): Promise<string> {
        if (!this._disableCache && this._cachedValue) {
            return Promise.resolve(this._cachedValue);
        }

        return StorageAsync.getValue(this._key);
    }

    async setAsync(val: string): Promise<boolean> {
        try {
            this._cachedValue = val;
            await StorageAsync.setValue(this._key, val);
            return true;
        } catch (err) {
            return false;
        }
    }
}

export default StorageAsync;
