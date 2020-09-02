import { groupBy } from 'common/utils/mathx';
import { AnyEvent, AssessmentEvent, EventIded, EventTypes, PromptEvent, TriggerPhraseNotificationEvent, NotificationBasedEvent } from 'common/models/Events';
import db, { Repo } from 'server/services/db';
import { DocumentSnapshot, getIdentify } from 'common/database/repositories/dbProvider';
import logger from 'common/logger';
import Identify from 'common/models/Identify';
import { NotificationSendRequest, processStatuses, pushNotifications } from 'server/services/notifications';
import { NotificationStatus, NotificationTypes } from 'common/models/Notifications';
import { PromptsLibrary, PromptType } from 'common/models/prompts';

const KeepEventsHistoryTimeMs = 24 * 3600 * 1000;

export async function triggerEvents() {
    const now = Date.now();
    const allEvents = await getEvents(now);
    if (!allEvents?.length) {
        return;
    }

    // group events by type
    const eventsData = groupBy<EventIded, EventTypes>(
        allEvents.filter(e => !e.triggered && e.timestamp <= now),
        e => e.type,
    );

    // process events
    const processes = Object.keys(eventsData)
        .map((type: EventTypes) => eventsProcess(type, eventsData[type]));
    await Promise.all(processes);

    // process notification statuses
    await processNotificationStatuses(allEvents);

    // save updated events to the DB
    const updateEventsPromises: Promise<any>[] = allEvents.map(e => {
        // delete triggered & outdated events
        if (e.triggered && now - e.triggered > KeepEventsHistoryTimeMs) {
            return Repo.Clients.removeClientEvent(e.clientUid, e.clientCardId, e.id, true);
        }

        // set processed events as triggered
        // update error and pendingNotifications
        const diff: Partial<AnyEvent> = {
            triggered: e.triggered || now,
            error: e.error || null,
        };
        if (AnyEvent.isNotificationsBased(e)) {
            const nDiff = diff as Partial<NotificationBasedEvent>;
            nDiff.notifications = e.notifications || null;
            nDiff.notificationDataSent = e.notificationDataSent || null;
        }

        return Repo.Clients.updateClientEvent(e.clientUid, e.clientCardId, e.id, diff);
    });

    await Promise.all(updateEventsPromises);
}

async function getEvents(now: number): Promise<EventIded[]> {
    try {
        const events = await db.value.collectionGroup('events')
        // skip future events, but keep triggered
            .where(nameof<EventIded>(e => e.timestamp), '<=', now)
            .get();

        const docs: DocumentSnapshot[] = events.docs;
        return docs.map(d => getIdentify<EventIded>(d));
    } catch (e) {
        logger.warn(e);
        return null;
    }
}

async function eventsProcess(type: EventTypes, events: EventIded[]) {
    let response: EventIded[] = [];
    switch (type) {
        case EventTypes.Prompt:
            await promptsEventsProcess(events as Identify<PromptEvent>[]);
            break;
        case EventTypes.Assessment:
            response = await assessmentEventsProcess(events as Identify<AssessmentEvent>[]);
            break;
        case EventTypes.TriggerPhrase:
            await triggerPhrasesEventsProcess(events as Identify<TriggerPhraseNotificationEvent>[]);
            break;
        default:
            return null;
    }

    return { type, response };
}

async function sendNotifications<T extends NotificationBasedEvent>(items: (NotificationSendRequest & { source: T})[]) {
    const responses = await pushNotifications(items);
    responses.forEach(r => {
        const e = r.request.source;
        const statuses = r.statuses?.filter(s => s.current === 'confirmed' || s.current === 'enqueued');
        if (!statuses?.length) {
            e.error = 'No target devices were available to send this message.';
            return;
        }

        e.notificationDataSent = r.request.data.data;
        e.notifications = nullifyArray(r.statuses);
    });
    return responses;
}

async function promptsEventsProcess(events: Identify<PromptEvent>[]) {
    try {
        const { prompts } = await getPromptContextData(events);
        const notifications: (NotificationSendRequest & { source: Identify<PromptEvent> })[] = [];

        events.forEach(event => {
            const promptText = prompts[event.promptId]?.text || event.text;
            if (!promptText) {
                event.error = 'No notification message';
                return;
            }

            notifications.push({
                uid: event.clientUid,
                data: {
                    body: promptText,
                    data: {
                        type: NotificationTypes.CustomPrompt,
                        promptId: event.promptId,
                        originalText: promptText,
                    },
                },
                source: event,
            });
        });

        await sendNotifications(notifications);
    } catch (e) {
        logger.warn(e);
        events.forEach(ev => {
            ev.error = 'Unexpected error occured: ' + JSON.stringify(e);
        });
    }
}

async function assessmentEventsProcess(events: Identify<AssessmentEvent>[]): Promise<EventIded[]> {
    return null;
}

async function triggerPhrasesEventsProcess(events: Identify<TriggerPhraseNotificationEvent>[]) {
    try {
        const notifications: (NotificationSendRequest & { source: Identify<TriggerPhraseNotificationEvent> })[] = [];

        events.forEach(event => {
            if (!event.text || !event.phrase) {
                event.error = 'No notification message';
                return;
            }

            notifications.push({
                uid: event.clientUid,
                data: {
                    body: event.text,
                    data: {
                        type: NotificationTypes.TriggerPhrase,
                        phrase: event.phrase,
                        phrasePrompt: event.text,
                    },
                    displayInForeground: true,
                },
                source: event,
            });
        });

        await sendNotifications(notifications);
    } catch (e) {
        logger.warn(e);
        events.forEach(ev => {
            ev.error = 'Unexpected error occured: ' + JSON.stringify(e);
        });
    }
}

async function getPromptContextData(events: PromptEvent[]) {

    const libraries: Record<string, PromptsLibrary> = { };
    const prompts: Record<string, PromptType> = { };

    const promises = events.map(async (e: PromptEvent) => {
        if (libraries[e.coachUid] !== undefined) {
            return;
        }

        libraries[e.coachUid] = { types: [], tips: [], goals: [] };
        const lib = await Repo.Coaches.getPromptsLibrary(e.coachUid);
        libraries[e.coachUid] = lib;

        lib.types.forEach(pt => {
            prompts[pt.id] = pt;
        });
    });

    await Promise.all(promises);

    // Custom prompts handler
    // const clientsIds = Object.keys(formattedUsers);
    // const clientPrompts = await db.value.collectionGroup('clientPrompts').where(FieldPath.documentId(), 'in', clientsIds).get();
    // const customPrompts: {[value: string]: {[value: string]: ClientPromptType}} = {};
    //
    // clientPrompts.forEach(doc => {
    //     const clientPrompt = doc.data() as ClientPrompts;
    //     clientPrompt.custom.forEach((prompt: ClientPromptType)  => {
    //         if (!customPrompts[doc.id]) {
    //             customPrompts[doc.id] = {};
    //         }
    //         customPrompts[doc.id][prompt.id] = prompt;
    //     });
    // });

    return {
        libraries,
        prompts,
    };
}

async function processNotificationStatuses(events: AnyEvent[]) {
    const notificationStatuses: NotificationStatus[] = events.reduce((arr, e) => {
        if (AnyEvent.isNotificationsBased(e)) {
            arr.push(...e.notifications);
        }
        return arr;
    }, []);

    await processStatuses(notificationStatuses);

    events.forEach(e => {
        if (!AnyEvent.isNotificationsBased(e) || !e.notifications) {
            return;
        }
        e.notifications = nullifyArray(e.notifications);
    });
}

function nullifyArray<T>(arr: T[]) {
    return arr?.length ? arr : null;
}
