import { TimeTrackingEntry, TimeTrackingEntryIded } from 'common/models/TimeTracking';
import Identify from 'common/models/Identify';

export type TimeTrackingBaseDto = {
    clientCardId: string,
    remove?: boolean,
};

export type TimeTrackingRequest = TimeTrackingBaseDto & { timeTracking: Identify<Partial<TimeTrackingEntry>> };
export type TimeTrackingResponse = TimeTrackingEntryIded;
