import { createLazy } from 'common/utils/lazy.light';
import firebase from 'firebase/app';

import { FirebaseApp } from './firebase.lib';
import { createLogger } from 'common/logger';

import { ClientFirestore } from 'common/database/repositories/dbProvider';
import { FunctionDefinition } from 'common/abstractions/functions.definition';
import { FunctionFactory } from './FunctionFactory';
import { Event, IEvent } from 'common/utils/event';

export type FirebaseRemoteConfig = firebase.remoteConfig.RemoteConfig;

export interface ConvertedRemoteConfig {
    [key: string]: boolean;
}

type RemoteConfigItems = {
    [key: string]: firebase.remoteConfig.Value;
};

export type FirebaseRemoteConfigSettings = firebase.remoteConfig.Settings;

let library: FirebaseApp;
let instance: firebase.app.App = null;
let firebaseConfig: FirebaseConfig = null;
let remoteConfig: FirebaseRemoteConfig = null;
let configVariables: ConvertedRemoteConfig = null;

const Settings = {
    functionsEmulatorUrl: '',
    firestoreEmulatorUrl: '',
};

export type FirebaseConfig = {
    apiKey?: string,
    authDomain: string,
    projectId: string,
    databaseURL: string,
    storageBucket: string,
    messagingSenderId: string,
    appId: string,
    measurementId?: string,
};

export type FirebaseSettings = Partial<typeof Settings> & {
    config: FirebaseConfig;
};

export type FirebaseUser = firebase.User;

const logger = createLogger('[Firebase]');

const _initialized = new Event();

export async function destroyAsync() {
    if (!instance) {
        return;
    }

    if (database.hasValue) {
        logger.log('Destroying Firestore...');
        await database.value.disableNetwork();
        await database.value.terminate();
        await database.value.clearPersistence();
        database.reset();
    }

    auth.reset();
    functions.reset();
    storage.reset();

    logger.log('Destroying existing Firebase app!!');
    await instance.delete();
    instance = null;
}

export async function initializeAsync(settings: FirebaseSettings) {
    await destroyAsync();

    const mod = await import('./firebase.lib');

    library = mod.default;

    // logger.log('FIREBASE CONFIG', settings.config);
    if (!settings.config) {
        throw new Error('Firebase config should be present in "settings.config".');
    }

    // Your web app's Firebase configuration
    firebaseConfig = {
        ...settings.config,
    };

    logger.log('Loading. API KEY =', firebaseConfig.apiKey);

    Object.assign(Settings, settings);
    logger.log('Settings:', Settings);

    // Initialize Firebase
    instance = library.initializeApp(firebaseConfig);
    if (firebaseConfig.apiKey === process.firebaseForPlatform.android.apiKey) {
        firebase.firestore().settings({ experimentalForceLongPolling: true });
    }

    logger.log('Initialized successfully');

    _initialized.trigger();
}

const auth = createLazy(() => instance.auth());
const functions = createLazy(() => {
    const fns = instance.functions();

    const { functionsEmulatorUrl } = Settings;
    if (functionsEmulatorUrl) {
        logger.log('Firebase functions Env.Firebase.FunctionsEmulator =', functionsEmulatorUrl);
        fns.useFunctionsEmulator(functionsEmulatorUrl);
    }

    return fns;
});
const database = createLazy(() => {
    const frstr = instance.firestore() as ClientFirestore;

    if (Settings.firestoreEmulatorUrl) {
        frstr.settings({
            host: Settings.firestoreEmulatorUrl,
            ssl: false,
        });
    }

    frstr.isClient = true;
    return frstr;
});
const storage = createLazy(() => instance.storage());

// RemoteConfig initializing (if needed)
export async function initializeRemoteConfigAsync(settings?: Partial<FirebaseRemoteConfigSettings>) {
    remoteConfig = instance.remoteConfig();

    if (settings) {
        remoteConfig.settings = {
            ...settings as FirebaseRemoteConfigSettings,
        };
    }

    try {
        await remoteConfig.fetchAndActivate();

        const configItems = remoteConfig.getAll();
        configVariables = getRemoteFirebaseConfig(configItems);

    } catch (err) {
        logger.error('Failed to initialize remote config. Error:', err);
    }
}

function getRemoteFirebaseConfig(configItems: RemoteConfigItems): ConvertedRemoteConfig {
    const config = {} as ConvertedRemoteConfig;
    const keys = Object.keys(configItems);

    keys.forEach((k: string) => {
        const booleanValue = remoteConfig.getBoolean(k);
        const key: string = k.toString();
        config[key] = booleanValue;
    });

    return config;
}

const wrapper = {
    get config(): Readonly<FirebaseConfig> { return firebaseConfig; },

    get auth() { return auth.value; },
    get functions() { return functions.value; },
    get database() { return database.value; },
    get storage() { return storage.value; },

    get GoogleProvider() { return library.auth.GoogleAuthProvider; },

    get FirebaseAuth() { return library.auth; },

    getFunction<TArg, TResult>(definition: FunctionDefinition<TArg, TResult>) {
        return new FunctionFactory<TArg, TResult>(definition, wrapper.functions);
    },

    get StorageEvent() { return library.storage.TaskEvent.STATE_CHANGED; },
};

export default {
    get Instance() {
        if (!instance) {
            throw new Error('Firebase: run initializeAsync before accessing Firebase instance');
        }
        return wrapper;
    },

    get isInitialized() { return !!instance; },
    get initialized(): IEvent { return _initialized; },
};
