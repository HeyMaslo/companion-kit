import Identify from './Identify';
import EnumHelper from 'common/utils/enumHelper';
import { AssessmentType } from 'common/models/intakeForms';
import { NotificationStatus, NotificationData } from './Notifications';

const day = 3600 * 24; // seconds

export enum EventFrequency {
    Day = day,
    Week = 7 * day,
    Month = 30 * day,
}

export namespace EventFrequency {
    export const Helper = new EnumHelper<EventFrequency>(EventFrequency);

    export const Strings =  {
        get [EventFrequency.Day]() { return 'Every day'; },
        get [EventFrequency.Week]() { return 'Every week'; },
        get [EventFrequency.Month]() { return 'Every month'; },
    };
}

export enum EventTypes {
    Prompt = 'prompt',
    Assessment = 'assessment',
    TriggerPhrase = 'triggerPhrase',
}

export type EventBase = {
    type: EventTypes,
    timestamp: number,
    text?: string,
    frequency?: EventFrequency,
    triggered?: number,
    error?: string,

    clientUid?: string;
    coachUid?: string;
    clientCardId?: string;
};

export type NotificationBasedEvent = EventBase & {
    notifications?: NotificationStatus[];
    notificationDataSent?: NotificationData;
};

export type PromptEvent = NotificationBasedEvent & {
    type: EventTypes.Prompt,
    promptId: string,
};

export type AssessmentEvent = EventBase & {
    type: EventTypes.Assessment,
    assessmentType: AssessmentType,
};

export type TriggerPhraseNotificationEvent = NotificationBasedEvent & {
    type: EventTypes.TriggerPhrase,
    phrase: string,
};

export type AnyEvent = PromptEvent | AssessmentEvent | TriggerPhraseNotificationEvent;

export namespace AnyEvent {
    export function isPrompt(e: AnyEvent): e is PromptEvent {
        const event = e as PromptEvent;
        return event?.type === EventTypes.Prompt;
    }

    export function isAssessment(e: AnyEvent): e is AssessmentEvent {
        const event = e as AssessmentEvent;
        return event?.type === EventTypes.Assessment;
    }

    export function isTriggerPhrase(e: AnyEvent): e is TriggerPhraseNotificationEvent {
        const event = e as TriggerPhraseNotificationEvent;
        return event?.type === EventTypes.TriggerPhrase;
    }

    export function isNotificationsBased(e: EventBase): e is NotificationBasedEvent {
        const ee = e as NotificationBasedEvent;
        return !!ee?.notifications;
    }
}

export type PromptEventIded = Identify<PromptEvent>;
export type EventIded = Identify<AnyEvent>;
