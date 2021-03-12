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
            UseMagicLink: false,
        };
    },
    get staging() { return FeatureSettings.production; },
};

export const EmailSettings: Record<Environments, EmailSettingsType> = {
    get production() {
        return {
            projectName: '${EMAIL_PROJECT_NAME}',
            sendgridTemplateId: '${EMAIL_SENDGRID_TEMPLATE_ID}',
            sendgridVerificationCodeTemplateId: '${EMAIL_SENDGRID_VERIFICATION_TEMPLATE_ID}',
            fromAddress: '${EMAIL_FROM_ADDRESS}',
            adminEmail: '${EMAIL_ADMIN_EMAIL}',
        };
    },
    get staging() {
        return {
            ...EmailSettings.production,
            projectName: '${EMAIL_PROJECT_NAME_PRODUCTION}',
            sendgridTemplateId: '${EMAIL_SENDGRID_TEMPLATE_ID}',
            sendgridVerificationCodeTemplateId: '${EMAIL_SENDGRID_VERIFICATION_TEMPLATE_ID}',
        };
    },
};

export const LinksSettings: Record<Environments, LinksSettingsType> = {
    get production() {
        return {
            ClientInvitationLink: '${DASHBOARD_CLIENT_INVITATION_LINK}',
            DashboardUrl: '${DASHBOARD_URL}',
            FirestoreUrl: '<your firebase url>',
        };
    },

    get staging() {
        return {
            ClientInvitationLink: '${DASHBOARD_CLIENT_INVITATION_LINK}',
            DashboardUrl: '${DASHBOARD_URL}',
            FirestoreUrl: '<your firebase url>',
        };
    },
};

export const Client: ClientsSettingsType = {
    mobile: {
        ios: '${CLIENT_SETTINGS_TYPE_IOS}',
        android: '${CLIENT_SETTINGS_TYPE_ANDROID}',
    },
};

export const PreActivedAssessments: AssessmentType[] = null;
