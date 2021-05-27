import { Platform } from 'react-native';

function getFirebaseConfig() {
    const original = process.firebase;
    const override = process.firebaseForPlatform;
    const overrideForPlatform = override && override[Platform.OS];
    if (overrideForPlatform) {
        return Object.assign(original, overrideForPlatform);
    }
    return original;
}

export default {
    Current: process.env.APP_ENV,
    AllowManualProcessing: false,
    // ShowRecordStats: true,
    // ShowRecordStats: process.env.APP_ENV !== 'production',
    ShowRecordStats: process.env.SHOW_RECORD_STATS === 'true',
    GaTrackingId: process.env.GA_TRACKING_ID, // 'UA-106568684-4',
    Firebase: {
        Config: getFirebaseConfig(),
        // FunctionsEmulator: 'http://192.168.1.69:5001',
        FunctionsEmulator: process.env.FIREBASE_FUNCTIONS_EMULATOR,
        FirestoreEmulator: process.env.FIRESTORE_EMULATOR,
        AllowDevLogin: process.env.ALLOW_DEV_LOGIN === 'true',
    },
    Google: process.google,
    SentryDSN: process.appIntegrations.SentryDsn,
    App: {
        Version: (process.appVersion || null) as string,
        Hash: process.env.APP_HASH,
    },
};
