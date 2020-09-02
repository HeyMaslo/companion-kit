import Identify from './Identify';
import { EnumStringHelper } from 'common/utils/enumHelper';

export enum TimeTrackingActivities {
    Assessment = 'Assessment',
    CaseManagement = 'Case management',
    Rehab = 'Rehab',
    Therapy = 'Therapy',
    Other = 'Other',
}

export namespace TimeTrackingActivities {
    export const Helper = new EnumStringHelper<TimeTrackingActivities>(TimeTrackingActivities);

    export const All = Helper.Values;
}

export type TimeTrackingEntry = {
    /** Date/time of the entry (unix ms)  */
    date: number;
    /** Tracked minutes */
    minutes: number;
    activity: TimeTrackingActivities;
    billable: boolean;
    /** only client-side validation from options in Client Card */
    diagnosis?: string;
    notes?: string;

    /** Create time (unix ms) */
    timestamp?: number;

    // for better locating it
    clientUid?: string;
    coachUid?: string;
    clientCardId?: string;
};

export type TimeTrackingEntryIded = Identify<TimeTrackingEntry>;
