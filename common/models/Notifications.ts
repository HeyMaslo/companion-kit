import { AssessmentType } from 'common/models/intakeForms';

export enum AndroidChannels {
    Reminders = 'reminders',

    Default = Reminders,
}

export enum NotificationTypes {
    Affirmation = 'affirmation',
    TestAffirmation = 'affirmationTest',
    Retention = 'retention',
    CustomPrompt = 'prompt',
    Assessment = 'assessment',
    NewGoals = 'newgoals',
    TriggerPhrase = 'triggerPhrase',
    NewDocumentLinkShared = 'docLinkShared',
}

export type NotificationRetentionData = {
    type: NotificationTypes.Retention;
};

export type NotificationAssessmentData = {
    type: NotificationTypes.Assessment;
    assessmentType: AssessmentType;
};

export type NotificationPromptData = {
    type: NotificationTypes.CustomPrompt;
    promptId: string;
    originalText: string;
};

export type NotificationNewGoalData = {
    type: NotificationTypes.NewGoals;
};

export type NotificationTriggerPhraseData = {
    type: NotificationTypes.TriggerPhrase;
    phrase: string,
    phrasePrompt: string,
};

export type NotificationDocLinkShareData = {
    type: NotificationTypes.NewDocumentLinkShared,
    docId: string,
};

export type NotificationAffirmationData = {
    type: NotificationTypes.Affirmation,
    docId: string,
};

export type NotificationData = NotificationRetentionData
    | NotificationAssessmentData
    | NotificationPromptData
    | NotificationNewGoalData
    | NotificationTriggerPhraseData
    | NotificationDocLinkShareData
    | NotificationAffirmationData;

export namespace NotificationData {
    export function guard(obj: any): obj is NotificationData {
        return !!obj?.type;
    }
}

export type NotificationSchedulingOptions = {
    time?: number | Date | undefined;
    repeat?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | undefined;
    intervalMs?: number | undefined;
};

export type NotificationResult = { body: string, date: string, id: string, affirmationId?: string };
export type ScheduleResult = { [key: string]: NotificationResult[] };

export type TokenInfo = { deviceId: string, value: string, isStandaloneDevice: boolean };

export type NotificationStatus = {
    receiptId: string,
    token: TokenInfo,
    current: 'enqueued' | 'invalidToken' | 'failed' | 'confirmed';
};
