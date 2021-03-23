import UserRoles from './UserRoles';
import { EntityWithStatus } from './EntityWithStatus';

export type InvitationState = 'created' | 'updated' | 'expired' | 'used';

type BaseInvitation = EntityWithStatus<InvitationState> & {
    email: string;

    name: {
        first: string,
        last: string,
        full?: string,
    };

    role: UserRoles,
    usedByUserId?: string;
    signInKey?: string,
    verificationCode: string;
};

export type ClientInvitation = BaseInvitation & {
    role: UserRoles.Client;

    coachId: string;
    clientCardId: string;
};

export type CoachInvitation = BaseInvitation & {
    role: UserRoles.Coach;
};

export type Invitation = ClientInvitation | CoachInvitation;

export namespace Invitation {
    export function isClient(invite: Invitation): invite is ClientInvitation {
        return invite && (invite.role == null || invite.role === UserRoles.Client);
    }

    export function isCoach(invite: Invitation): invite is CoachInvitation {
        return invite?.role === UserRoles.Coach;
    }

    export function isValid(invite: Invitation) {
        return (invite.status === 'created' || invite.status === 'updated') && !invite.usedByUserId;
    }

    export function changeStatus(invite: Invitation, state: InvitationState, date: number = null) {
        return EntityWithStatus.changeStatus<Invitation, InvitationState>(invite, state, date);
    }

    export function getLastStatusDate(invite: Invitation, ...states: InvitationState[]) {
        return EntityWithStatus.getLastStatusDate(invite, ...states);
    }
}
