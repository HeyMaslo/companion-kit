import { EntityWithStatus } from 'common/models/EntityWithStatus';
import { GoalType } from './GoalType';

export enum GoalStatus {
    New = 'new',
    Seen = 'seen',
    Completed = 'completed',
    Incomplete = 'incomplete',
}

export type ClientGoalState = EntityWithStatus<GoalStatus> & {
    goalId: string,

    active?: boolean,
};

export namespace ClientGoalState {
    export function changeStatus(state: ClientGoalState, status: GoalStatus, date: number = null) {
        return EntityWithStatus.changeStatus(state, status, date);
    }

    export function getLastStatusDate(tip: ClientGoalState, ...statuses: GoalStatus[]) {
        return EntityWithStatus.getLastStatusDate(tip, ...statuses);
    }
}

export type GoalWithStatus = GoalType & { status: GoalStatus };
