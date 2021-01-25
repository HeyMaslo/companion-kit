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
            FreeAccessForNewUsers: true,
            EditablePrompts: true,
            Interventions: false,
            ScheduleEvents: true,
            MobileStandalone: false,
            ExportToBQ: true,
            TimeTrackingEnabled: true,
            Goals: true,
            SendSmsOnTriggerPhrases: true,
            PicturesCheckInsEnabled: false,
        };
    },
    get staging() { return FeatureSettings.production; },
};

export const EmailSettings: Record<Environments, EmailSettingsType> = {
    get production() {
        return {
            projectName: 'Companion kit',
            sendgridTemplateId: 'd-5554ed3a2e7940c39daf251b4625895c',
            fromAddress: 'rowdl22@students.cs.ubc.ca',
            adminEmail: 'rowdl22@students.cs.ubc.ca',
        };
    },
    get staging() {
        return {
            ...EmailSettings.production,
            projectName: 'Companion kit [Staging]',
            sendgridTemplateId: 'd-5554ed3a2e7940c39daf251b4625895c',
        };
    },
};

export const LinksSettings: Record<Environments, LinksSettingsType> = {
    get production() {
        return {
            ClientInvitationLink: 'https://bipolarbridges.page.link/magic',
            DashboardUrl: 'https://bipolarbridges.web.app',
            FirestoreUrl: '<your firebase url>',
        };
    },

    get staging() {
        return {
            ClientInvitationLink: 'https://bipolarbridges.page.link/magic',
            DashboardUrl: 'https://bipolarbridges.web.app',
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
