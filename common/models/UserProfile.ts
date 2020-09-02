import UserRoles from './UserRoles';
import { BillingInfo } from './Billing';
import Identify from './Identify';

/** General public info for all users, sho */
export interface UserPublicProfile {
    displayName: string;
    photoURL: string;
}

/** General info for all users */
export default interface UserProfile extends UserPublicProfile {
    firstName: string;
    lastName: string;

    email: string;

    phone?: string;

    roles: UserRoles;

    bio?: string;
    billing?: BillingInfo;

    zipcode?: string,

    // service fields
    readonly freeAccess?: boolean;
    readonly maxClientsCount?: number;
    readonly isAdmin?: boolean;
    readonly isTester?: boolean;
}

export type UserProfileIded = Identify<UserProfile>;
