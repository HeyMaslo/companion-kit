import { FocusedDomains } from '../../mobile/src/constants/Domain';
import { Affirmation, PartialQol } from '../../mobile/src/constants/QoL';

export type LastSeen = {
    // key is affirmationID and number is date
    [key: string]: number,
};

export type ScheduledAffirmationNotification = {
    scheduledDate: number,
    notifId: string,
    affirmation: Affirmation,
};

export type UserState = {
    surveyState: PartialQol;
    focusedDomains: FocusedDomains;
    chosenStrategies: string[]; // array of Strategy.internalId (firestore document id) to reference strategies in the strategies collection
    lastSeenAffirmations: LastSeen, // keeps track of affirmations that have been seen/scheduled at which date
    scheduledAffirmations: ScheduledAffirmationNotification[], // only contains upcoming affirmation notifications
};
