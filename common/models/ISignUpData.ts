import UserRoles from './UserRoles';
import FullUser from './FullUser';
import { ClientAccount } from './ClientProfile';

export interface ICoachSignUpData {
    firstName: string;
    lastName: string;
    email: string;

    password: string;

    displayName?: string;
    photoUrl?: string;

    selectedPlan?: string;
    organization?: string;

    phoneNumber?: string;
}

export type SignUpData = ( { role: UserRoles.Coach } & ICoachSignUpData ) | { role: UserRoles.Client };

export type SignUpCoachResult = FullUser;
export type SignUpClientResult = {
    createdAccount?: ClientAccount,
    message?: string,
};

export type SignUpResult = SignUpCoachResult | SignUpClientResult;
