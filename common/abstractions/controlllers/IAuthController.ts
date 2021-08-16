import { IEvent } from 'common/utils/event';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';

export type AuthUser = {
    uid: string,
    displayName: string,
    email: string,
    photoURL: string,

    providers: ReadonlyArray<AuthProviders>,
    currentProvider: AuthProviders,
};

export enum AuthProviders {
    None = '',
    EmailLink = 'emaillink',
    EmailAndPassword = 'emailpassword',
    Google = 'google',
    Apple = 'apple',
    DevLogin = 'devLogin',
}

export type FirebaseError = Error & { code: string };

export interface IAuthController {
    readonly authUser: Readonly<AuthUser>;
    readonly initializing: boolean;

    readonly needsCreatePassword: boolean | null;

    readonly magicLinkSucceeded: IEvent<MagicLinkRequestReasons>;

    readonly onPreProcessUser: IEvent<AuthUser>;
    readonly onSignOut: IEvent;

    readonly setPasswordMode: boolean;

    skipPasswordMode(): void;

    getEmailAuthMethod(email: string): Promise<AuthProviders[]>;
    getHasAccount(email: string): Promise<boolean>;
    hasAccount(email: string): Promise<boolean>;

    validateCode(email: string, code: string): Promise<{ result: boolean }>;
    signInWithEmailLink(email: string, reason: MagicLinkRequestReasons): Promise<void>;
    signInWithEmailPassword(email: string, password: string): Promise<void>;
    createAccountForEmailAndPassword(email: string, password: string): Promise<void>;
    resetPassword(email: string, newPassword: string): Promise<{ result: boolean }>;
    createAccountForEmailAfterVerificationCode(email: string): Promise<{ result: boolean }>;
    sendVerificationCodeByEmail(email: string): Promise<{ result: boolean } | 'noInvitation'>;
    signInWithEmailOnly(email: string): Promise<{ result: boolean }>;

    signInWithGoogle(): Promise<boolean>;

    getAuthToken(): Promise<GetTokenResult>

    signOut(): Promise<void>;

    updatePassword(password: string, oldPassword?: string): Promise<AuthResult>;
    updatePasswordWithEmail(email: string, password: string, oldPassword?: string): Promise<AuthResult>;

    devLogin(email: string): Promise<void>;

    updatePhotoUrl(photoUrl: string): Promise<void>;
}

export type AuthResult = { result: true } | { result: false, error: AuthErrors, original: FirebaseError };

export type GetTokenResult = (AuthResult & { token?: string });

export enum AuthErrors {
    Unknown = 0,
    InvalidAuthState,
    WrongPassword,
    NeedsReauthentication,
}
