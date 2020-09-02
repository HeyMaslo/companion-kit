import Identify from './Identify';
import { EntityWithStatus } from './EntityWithStatus';
import { ClientAssessments } from './ClientAssessments';
import { ClientStatus } from './ClientCard';

/**
 * Entity linked to user with 'client' role.
 * Also contains client-specific setttings & data
 */
export type ClientProfile = {
    onboarded?: boolean;
    /** timestamps of recorded journals */
    journalsHistory: number[];
    consentAccepted?: { option: string, date: number };
};

/**
 * Subcollection item of ClientProfile
 */
export type ClientAccount = EntityWithStatus<ClientStatus> & {
    /** Coach UID  */
    coachId: string;
    coachName: string;

    assessments?: ClientAssessments,

    /** Client opts in to share their last reward with their therapist */
    sharedReward?: ClientRewardInfo,
};

export type ClientRewardInfo = {
    date?: number,
    checkInsCount: number,
    streakLength?: number,
};

export type ClientAccountIded = Identify<ClientAccount>;
