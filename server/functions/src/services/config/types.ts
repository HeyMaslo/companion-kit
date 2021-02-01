export type Environments = 'production' | 'staging';

export type FeaturesSettingsType = {
    BillingDisabled: boolean,
    IntakeFormsEnabled: boolean,
    SessionsDisabled: boolean,
    DocumentsEnabled: boolean,
    CaretakersEnabled: boolean,
    FreeAccessForNewUsers: boolean,
    EditablePrompts: boolean,
    Interventions: boolean,
    ScheduleEvents: boolean,
    MobileStandalone: boolean,
    ExportToBQ: boolean,
    TimeTrackingEnabled: boolean,
    Goals?: boolean,
    SendSmsOnTriggerPhrases?: boolean;
    PicturesCheckInsEnabled?: boolean;
    UseMagicLink?: boolean;
};

export type EmailSettingsType = {
    projectName: string,
    sendgridTemplateId: string,
    sendgridVerificationCodeTemplateId: string,
    fromAddress: string,
    adminEmail: string,
};

export type LinksSettingsType = {
    ClientInvitationLink: string,
    DashboardUrl: string,
    FirestoreUrl: string,
};

export type ClientsSettingsType = {
    mobile: {
        ios: string,
        android: string,
    },
};
