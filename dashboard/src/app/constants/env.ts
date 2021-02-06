export default {
    Current: process.env.APP_ENV as 'development' | 'staging' | 'production',
    Firebase: {
        Configuration: process.firebase,
        // FunctionsEmulator: 'http://localhost:5001',
        FunctionsEmulator: process.env.FIREBASE_FUNCTIONS_EMULATOR,
        FirestoreEmulator: process.env.FIRESTORE_EMULATOR,
    },
    App: {
        Version: (process.appVersion || null) as string,
        Hash: process.env.APP_HASH,
    },
    AllowDevLogin: process.env.ALLOW_DEV_LOGIN === 'true',
    GaTrackingId: process.env.GA_TRACKING_ID, // 'UA-106568684-4',
    PaymentDisabled: process.env.PAYMENT_DISABLED === 'true',
    StripeProviderKey: process.appIntegrations.StripeProviderKey,
    OpenAIUrl: 'https://empatheticcomputingengine.uc.r.appspot.com/promptSuggestion',
};
