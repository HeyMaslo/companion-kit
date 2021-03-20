import * as functions from 'firebase-functions';
import { } from 'common/declarations/process';
import { AssessmentType } from 'common/models';
import { Environments, FeaturesSettingsType, EmailSettingsType, LinksSettingsType, ClientsSettingsType } from './types';

import * as app from './app';

export type MemoryOptions = typeof functions.VALID_MEMORY_OPTIONS[number];

let configEnvs = functions.config().envs || { };

const isTrue = (v: any) => (v === true || v === 'true');

export const IS_PROD = isTrue(configEnvs.is_prod);

// dirty hack for common libraries that rely on that
process.env.APP_ENV = IS_PROD ? 'production' : 'staging';

if (!IS_PROD) {
    // supress config warnings
    const ownProperties = Object.getOwnPropertyNames(configEnvs);
    configEnvs = ownProperties.reduce((res, p) => { res[p] = configEnvs[p]; return res; }, { });
}

export const SENDGRID_API_KEY: string = configEnvs.sendgrid_api_key;
export const SENDGRID_EMAIL_VALIDATION_API_KEY: string = null; // configEnvs.sendgrid_emails_validation_api_key;
export const EMAIL_OVERRIDE_ADDRESS: string = configEnvs.email_override_address;
export const STRIPE_WEBHOOK_KEY: string = configEnvs.stripe_webhook_key;
export const STRIPE_API_KEY: string = configEnvs.stripe_api_key;
export const TWILIO_AUTH_TOKEN: string = configEnvs.twilio_auth_token;
export const TWILIO_ACCOUNT_SID: string = configEnvs.twilio_account_sid;
export const TWILIO_PHONE_NUMBER_FROM: string = configEnvs.twilio_phone_number_from;

type ProjectConfig = {
    FeatureSettings: Record<Environments, FeaturesSettingsType>,
    EmailSettings: Record<Environments, EmailSettingsType>,
    LinksSettings: Record<Environments, LinksSettingsType>,
    Client: ClientsSettingsType,
    PreActivatedAssessments?: AssessmentType[],
    AllowedForceLoginEmails?: string[];
};

const projectConfigs: ProjectConfig = app;

const env: Environments = IS_PROD ? 'production' : 'staging';

export const EmailSettings = projectConfigs?.EmailSettings[env];
export const FeatureSettings = projectConfigs?.FeatureSettings[env];
export const LinksSettings = projectConfigs?.LinksSettings[env];
export const ClientSettings = projectConfigs?.Client;
export const PreActivatedAssessments = projectConfigs?.PreActivatedAssessments;
export const AllowedForceLoginEmails = projectConfigs?.AllowedForceLoginEmails || [
    'demo@maslo.ai',
];

export const MobileStandaloneCoachEmail = 'maslo@zajno.com';

process.appFeatures = {
    ASSESSMENTS_ENABLED: FeatureSettings.IntakeFormsEnabled,
    BILLING_DISABLED: FeatureSettings.BillingDisabled,
    CLIENT_CARETAKERS_ENABLED: FeatureSettings.CaretakersEnabled,
    INTERVENTIONS_ENABLED: FeatureSettings.EditablePrompts,
    MOBILE_ONBOARDING_ENABLED: undefined,
    MOBILE_SHOW_CONSENT: undefined,
    MOBILE_STANDALONE: FeatureSettings.MobileStandalone,
    MOBILE_STATIC_TIPS_ENABLED: undefined,
    EDITABLE_PROMPTS_ENABLED: FeatureSettings.EditablePrompts,
    SESSIONS_DISABLED: FeatureSettings.SessionsDisabled,
    COACH_TIME_TRACKING_ENABLED: FeatureSettings.TimeTrackingEnabled,
    NOTES_ON_INDIVIDUALS: undefined,
    PICTURE_CHECKINS_ENABLED: FeatureSettings.PicturesCheckInsEnabled,
    USE_MAGIC_LINK: FeatureSettings.UseMagicLink,
};
