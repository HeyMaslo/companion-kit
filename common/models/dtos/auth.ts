import UserRoles from 'common/models/UserRoles';

export enum AuthActionTypes {
    CheckRole = 'checkrole',
    CheckInvite = 'checkInvite',
    MagicLinkSignIn = 'magiclink',
    SendLinkToDesktop = 'sendLinkToDesktop',
    ForceLogin = 'forcelogin',
    GenerateMagicLink = 'generateMagicLink',
}

export type BaseResponse = {
    result: boolean,
    error?: string,
};

export enum MagicLinkRequestReasons {
    SignIn = 'signin',
    SignUp = 'signup',
    PasswordReset = 'password',
    PasswordChange = 'passwordChange',
    EmailReset = 'email',
}

export type MagicLinkRequest = {
    email: string,
    continueUrl: string,

    role: UserRoles,
    reason?: MagicLinkRequestReasons,
    fullname?: string,
};

export type CheckRoleRequest = {
    email: string,
    role: UserRoles,
};

export type CheckInviteRequest = CheckRoleRequest & {
    key: string,
};

export type ForceLoginRequest = {
    email: string,
};

export type AuthRequest = (MagicLinkRequest & { type: AuthActionTypes.MagicLinkSignIn })
    | (CheckRoleRequest & { type: AuthActionTypes.CheckRole })
    | { type: AuthActionTypes.SendLinkToDesktop }
    | (CheckInviteRequest & { type: AuthActionTypes.CheckInvite })
    | (ForceLoginRequest & { type: AuthActionTypes.ForceLogin })
    | (MagicLinkRequest & { type: AuthActionTypes.GenerateMagicLink })
;

export type AuthResponse = BaseResponse | { token: string } | { magicLink: string };
