import IStorage from '../../../../../common/abstractions/services/storage';

const data = {};

const StorageMock: IStorage = {
    getValue(key: string): Promise<string> {
        return data[key];
    },

    setValue(key: string, value: string): Promise<void> {
        if (!key) {
            throw new Error('[StorageAsync] key must be not empty! got:' + key);
        }
        if (!value) {
            throw new Error('[StorageAsync] value must be not null! use \'remove\' instead. Got: ' + `${key} | ${value}` );
        }
        return new Promise((res, rej) => {
            data[key] = value;
            res();
        });
    },

    async hasValue(key: string): Promise<boolean> {
        try {
            const value = await StorageMock.getValue(key);
            return !!value;
        } catch (err) {
            return false;
        }
    },

    remove(key: string): Promise<void> {
        return new Promise((res, rej) => {
            data[key] = null;
            res();
        });
    },
};

export default StorageMock;