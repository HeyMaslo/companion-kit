import UserRoles from 'common/models/UserRoles';

export enum AuthActionTypes {
    CheckRole = 'checkrole',
    CheckInvite = 'checkInvite',
    MagicLinkSignIn = 'magiclink',
    SendLinkToDesktop = 'sendLinkToDesktop',
    ForceLogin = 'forcelogin',
    GenerateMagicLink = 'generateMagicLink',
    SendVerificationCodeEmail = 'sendVerificationCodeEmail',
    ValidateCode = 'validateCode',
    ResetPassword = 'resetPassword',
    GenerateToken = 'generateToken',
    HasAccount = 'hasAccount',
    ValidateToken = 'validateToken',
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
    useVerificationCode?: boolean,
};

export type ForceLoginRequest = {
    email: string,
};

export type SendVerificationCodeEmailRequest = {
    email: string,
};

export type ValidateCodeRequest = {
    email: string;
    code: string;
};

export type ResetPasswordRequest = {
    email: string,
    newPassword: string,
};

export type GenerateTokenRequest = {
    email: string,
};

export type HasAccountRequest = {
    email: string,
};

export type ValidateTokenRequest = {
    email: string,
    token: string,
};

export type AuthRequest = (MagicLinkRequest & { type: AuthActionTypes.MagicLinkSignIn })
    | (CheckRoleRequest & { type: AuthActionTypes.CheckRole })
    | { type: AuthActionTypes.SendLinkToDesktop }
    | (CheckInviteRequest & { type: AuthActionTypes.CheckInvite })
    | (ForceLoginRequest & { type: AuthActionTypes.ForceLogin })
    | (MagicLinkRequest & { type: AuthActionTypes.GenerateMagicLink })
    | (SendVerificationCodeEmailRequest & { type: AuthActionTypes.SendVerificationCodeEmail })
    | (ResetPasswordRequest & { type: AuthActionTypes.ResetPassword })
    | (GenerateTokenRequest & { type: AuthActionTypes.GenerateToken })
    | (HasAccountRequest & { type: AuthActionTypes.HasAccount })
    | (ValidateCodeRequest & { type: AuthActionTypes.ValidateCode })
    | (ValidateTokenRequest & { type: AuthActionTypes.ValidateToken })
    ;

export type AuthResponse = BaseResponse | { token: string } | { magicLink: string } | 'noInvitation';
