import { Environments, FeaturesSettingsType, EmailSettingsType, LinksSettingsType, ClientsSettingsType } from './types';
import { AssessmentType } from 'common/models';

export const FeatureSettings: Record<Environments, FeaturesSettingsType> = {
    get production() {
        return  <FeaturesSettingsType>{
            BillingDisabled: true,
            IntakeFormsEnabled: true,
            SessionsDisabled: true,
            DocumentsEnabled: true,
            CaretakersEnabled: true,
            FreeAccessForNewUsers: false,
            EditablePrompts: true,
            Interventions: true,
            ScheduleEvents: true,
            MobileStandalone: false,
            ExportToBQ: true,
            TimeTrackingEnabled: true,
            Goals: true,
            SendSmsOnTriggerPhrases: true,
            PicturesCheckInsEnabled: true,
            UseMagicLink: false,
        };
    },
    get staging() { return FeatureSettings.production; },
};

export const EmailSettings: Record<Environments, EmailSettingsType> = {
    get production() {
        return {
            projectName: 'Companion kit',
            sendgridTemplateId: 'd-047698cabf8846c985bda62b50850f2d',
            sendgridVerificationCodeTemplateId: 'd-563f0dc484224cec84034e1bbbf4367e',
            fromAddress: 'Companion kit Team <your email>',
            adminEmail: '<your email>',
        };
    },
    get staging() {
        return {
            ...EmailSettings.production,
            projectName: 'Companion kit [Staging]',
            sendgridTemplateId: 'd-7c4aec9db7714096b15340b90675883d',
            sendgridVerificationCodeTemplateId: 'd-563f0dc484224cec84034e1bbbf4367e',
        };
    },
};

export const LinksSettings: Record<Environments, LinksSettingsType> = {
    get production() {
        return {
            ClientInvitationLink: '<your email invite>',
            DashboardUrl: '<your dashboard url>',
            FirestoreUrl: '<your firebase url>',
        };
    },

    get staging() {
        return {
            ClientInvitationLink: '<your email invite>',
            DashboardUrl: '<your dashboard url>',
            FirestoreUrl: '<your firebase url>',
        };
    },
};

export const Client: ClientsSettingsType = {
    mobile: {
        ios: 'com.companionkit.ios',
        android: 'com.companionkit.android',
    },
};

export const PreActivedAssessments: AssessmentType[] = null;
