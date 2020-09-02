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

    signInWithEmailLink(email: string, reason: MagicLinkRequestReasons): Promise<void>;
    signInWithEmailPassword(email: string, password: string): Promise<void>;
    createAccountForEmailAndPassword(email: string, password: string): Promise<void>;

    signInWithGoogle(): Promise<boolean>;

    signOut(): Promise<void>;

    updatePassword(password: string, oldPassword?: string): Promise<AuthResult>;

    devLogin(email: string): Promise<void>;

    updatePhotoUrl(photoUrl: string): Promise<void>;
}

export type AuthResult = { result: true } | { result: false, error: AuthErrors, original: FirebaseError };

export enum AuthErrors {
    Unknown = 0,
    InvalidAuthState,
    WrongPassword,
    NeedsReauthentication,
}
