import { FirebaseConfig } from 'common/services/firebase';

export type AppFeaturesConfig = {
    BILLING_DISABLED: boolean;
    SESSIONS_DISABLED: boolean;
    ASSESSMENTS_ENABLED: boolean;
    EDITABLE_PROMPTS_ENABLED: boolean;
    MOBILE_ONBOARDING_ENABLED: boolean,
    CLIENT_CARETAKERS_ENABLED: boolean,
    MOBILE_STANDALONE: boolean,
    MOBILE_SHOW_CONSENT: boolean,
    MOBILE_STATIC_TIPS_ENABLED: boolean,
    INTERVENTIONS_ENABLED: boolean,
    COACH_TIME_TRACKING_ENABLED: boolean,
    NOTES_ON_INDIVIDUALS: boolean,
    GOALS_ENABLED?: boolean,
    CLIENT_REWARDS_ENABLED?: boolean,
    PICTURE_CHECKINS_ENABLED?: boolean,
    USE_MAGIC_LINK: boolean
};

export type FirebasePlatformConfig = Record<'android' | 'ios', Partial<FirebaseConfig>>;

export type GoogleConfig = {
    ClientIdNative: string,
    ExpoClientIdAndroid: string,
    ExpoClientIdIOS: string,
};

export type IntegrationConfigs = {
    StripeProviderKey?: string,
    SentryDsn: string,
}

declare global {
    namespace NodeJS {

        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            APP_ENV: 'production' | 'staging' | 'development';
        }

        interface Process {
            env: ProcessEnv;
            appVersion: string;
            appFeatures: AppFeaturesConfig;
            firebase: FirebaseConfig;
            firebaseForPlatform: FirebasePlatformConfig,
            google: GoogleConfig;
            appIntegrations: IntegrationConfigs;
            developVersion?: string;
        }
    }
}
