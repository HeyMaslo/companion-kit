import { Event, IEvent } from 'common/utils/event';
import { createLogger } from 'common/logger';




export enum GlobalTriggers {
    SignOut = 1000,
    CreateStory,
    EmailSettings,
    SetNewPassword,
    NotifictaionSettings,
    Home,
    Goals,
    Settings,
    Profile,
    NotificationReceived,
    HealthAuthSettings,
    GetAuthInstructSettingsView
}

const logger = createLogger('[Globaltriggers]');

const globalTriggerEvent = new Event<GlobalTriggers>();

const supressedTriggers = new Set<GlobalTriggers>();

export const GlobalTriggerEvent: IEvent<GlobalTriggers> = globalTriggerEvent;

export async function GlobalTrigger(t: GlobalTriggers) {
    if (supressedTriggers.has(t)) {
        logger.warn(`Trigger '${GlobalTriggers[t]}' has been supressed!`);
        return false;
    }

    await globalTriggerEvent.triggerAsync(t);
    return true;
}

export function setTriggerEnabled(t: GlobalTriggers, value: boolean) {
    if (value) {
        supressedTriggers.delete(t);
    } else {
        supressedTriggers.add(t);
    }
}
