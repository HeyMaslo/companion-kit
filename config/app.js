/** @typedef {(import ('../common/services/firebase').FirebaseConfig)} FirebaseConfig */
/** @typedef {(import ('../common/declarations/process').AppFeaturesConfig)} AppFeaturesConfig */
/** @typedef {(import ('../common/declarations/process').FirebasePlatformConfig)} FirebasePlatformConfig */
/** @typedef {(import ('../common/declarations/process').GoogleConfig)} GoogleConfig */
/** @typedef {(import ('../common/declarations/process').IntegrationConfigs)} IntegrationConfigs */

/** @typedef {import('./declarations').Environments} Environments */
/** @typedef {import('./declarations').IncludeConfig} IncludeConfig */
/** @typedef {import('./declarations').BuildConfig} BuildConfig */

/** @type {Record<Environments, FirebaseConfig>} */
const FirebaseConfigs = {
    production: {
        apiKey: "...",
        authDomain: "...",
        databaseURL: "...",
        projectId: "...",
        storageBucket: "...",
        messagingSenderId: "...",
        appId: "...",
        measurementId: "..."
    },
    get staging() { return FirebaseConfigs.production },
    get development() { return FirebaseConfigs.staging; },
};

/** @type {Record<Environments, FirebasePlatformConfig>} */
const FirebasePlatformOverrides = {
    production: {
        ios: {
            appId: '...',
            apiKey: '...',
        },
        android: {
            appId: '...',
            apiKey: '...',
        },
    },
    get staging() { return FirebasePlatformOverrides.production; },
    get development() { return FirebasePlatformOverrides.staging; },
};

/** @type {Record<Environments, GoogleConfig>} */
const GoogleConfigs = {
    production: {
        ClientIdNative: '',
        ExpoClientIdAndroid: '...', // android app id
        ExpoClientIdIOS: '...' // ios app id,
    },
    get staging() { return GoogleConfigs.production; },
    get development() { return GoogleConfigs.staging; },
};

/** @type {Record<Environments, IntegrationConfigs>} */
const Integrations = {
    production: {
        SentryDsn: '...' // sentry url,
    },
    get staging() { return Integrations.production; },
    get development() { return Integrations.staging; },
};

/** @type {Record<Environments, AppFeaturesConfig>} */
const FeaturesConfig = {
    /** @type {AppFeaturesConfig} */
    get production() {
        return {
            BILLING_DISABLED: true,
            SESSIONS_DISABLED: true,
            ASSESSMENTS_ENABLED: true,
            EDITABLE_PROMPTS_ENABLED: true,
            MOBILE_ONBOARDING_ENABLED: false,
            CLIENT_CARETAKERS_ENABLED: false,
            MOBILE_STANDALONE: false,
            MOBILE_SHOW_CONSENT: false,
            MOBILE_STATIC_TIPS_ENABLED: false,
            INTERVENTIONS_ENABLED: false,
            COACH_TIME_TRACKING_ENABLED: false,
            NOTES_ON_INDIVIDUALS: false,
            GOALS_ENABLED: false,
            CLIENT_REWARDS_ENABLED: false,
            PICTURE_CHECKINS_ENABLED: false,
        };
    },
    get staging() { return FeaturesConfig.production; },
    get development() { return FeaturesConfig.staging; },
};

const includeConfigs = [
    {
        id: 'firebase',
        obj: FirebaseConfigs,
    },
    {
        id: 'firebaseForPlatform',
        obj: FirebasePlatformOverrides,
    },
    {
        id: 'google',
        obj: GoogleConfigs,
    },
    {
        id: 'appIntegrations',
        obj: Integrations,
    },
    {
        id: 'appFeatures',
        obj: FeaturesConfig,
        recursiveFlat: true,
    },
];

/** @type {Record<Environments, BuildConfig>} */
const BuildConfigs = {
    production: {
        hostname: {
            dashboard: '...', // url for dashboard
            web: '...', // url for website
        },
        mobile: {
            releaseChannel: '...', // expo release channel
            configName: '...', // bundle id
        },
    },
    get development() { return BuildConfigs.production; },
    get staging() { return BuildConfigs.production; },
};

module.exports = {
    includeConfigs,
    BuildConfigs,
};
