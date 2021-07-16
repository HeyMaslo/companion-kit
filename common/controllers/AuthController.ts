import {
    IAuthController,
    AuthUser,
    AuthProviders,
    AuthResult,
    AuthErrors,
} from 'common/abstractions/controlllers/IAuthController';
import { observable } from 'mobx';
import Firebase from 'common/services/firebase';
import { createLogger } from 'common/logger';
import { UserRoles } from 'common/models';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import IStorage from 'common/abstractions/services/storage';
import { Event } from 'common/utils/event';
import { prepareEmail } from 'common/utils/emails';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';
import { ClientSettings } from 'common/abstractions/services';

export const logger = createLogger('[Auth]');

const AuthProviderIdKey = 'auth:providerid';
const UserSignInEmailStorageKey = 'auth:signin:email';
const MagicLinkReasonKey = 'auth:signin:reason';
const PasswordResetRequestedKey = 'auth:passwordreset';

export default abstract class AuthControllerBase implements IAuthController {
    @observable
    private _authUser: AuthUser = null;

    @observable
    protected _initializing = 0;

    private _nextProvider: AuthProviders = null;
    private readonly _magicLinkSucceeded = new Event<MagicLinkRequestReasons>();

    @observable
    private _setPasswordMode: boolean = false;

    private readonly _onSignOut = new Event();
    private readonly _onPreProcessUser = new Event<AuthUser>();

    @observable
    private _firstInit = true;

    constructor() {
        Firebase.Instance.auth.onAuthStateChanged(async () => {
            this.doInitialization(this.processAuthUser.bind(this));
        });
    }

    get authUser(): AuthUser { return this._authUser; }
    get initializing() { return this._firstInit || this._initializing !== 0; }
    get magicLinkSucceeded() { return this._magicLinkSucceeded.expose(); }

    get setPasswordMode() { return this._setPasswordMode; }
    get needsCreatePassword(): boolean | null {
        if (!this.authUser || !this.authUser.providers || !this.authUser.currentProvider
            || this.authUser.currentProvider === AuthProviders.Google
            || this.authUser.currentProvider === AuthProviders.DevLogin) {
            return null;
        }

        return !this.authUser.providers.includes(AuthProviders.EmailAndPassword);
    }

    get onPreProcessUser() { return this._onPreProcessUser.expose(); }
    get onSignOut() { return this._onSignOut.expose(); }

    get appleSignInSupported() { return false; }

    abstract get targetRole(): UserRoles;
    abstract get locationUrl(): string;

    protected abstract get Storage(): IStorage;

    get logger() { return logger; }

    protected async processAuthUser() {
        this._firstInit = false;
        const authUser = Firebase.Instance.auth.currentUser;

        const methods = authUser && await this.getEmailAuthMethod(authUser.email);

        let provider: AuthProviders;
        if (!authUser) {
            provider = null;
        } else if (this._nextProvider) {
            // logger.log('NEXT PROVIDER ====>', this._nextProvider);
            provider = this._nextProvider;
            this._nextProvider = null;
            await this.Storage.setValue(AuthProviderIdKey, provider);
        } else {
            provider = (await this.Storage.getValue(AuthProviderIdKey) || '') as AuthProviders;
        }

        logger.log('Initializing with user:', authUser?.email, '; provider =', provider, '; uid =', authUser?.uid);

        const signedIn = !this._authUser && authUser;

        const result: AuthUser = authUser ? {
            email: authUser.email,
            displayName: authUser.displayName,
            uid: authUser.uid,
            photoURL: authUser.photoURL,
            providers: methods || [],
            currentProvider: provider,
        } : null;

        await this._onPreProcessUser.triggerAsync(result);

        this._authUser = result;

        if (signedIn) {
            const createPassword = this.needsCreatePassword;
            const resetPassword = provider === AuthProviders.EmailLink && (await this.Storage.getValue(PasswordResetRequestedKey)) === 'true';
            if (createPassword || resetPassword) {
                logger.log('Setting _setPasswordMode = true createPassword =', createPassword, 'resetPassword =', resetPassword);
                this._setPasswordMode = true;
            }
        }
    }

    protected forceEnableSetPasswordMode() {
        this._setPasswordMode = true;
    }

    public skipPasswordMode(): void {
        this._setPasswordMode = false;
        this.Storage.remove(PasswordResetRequestedKey);
    }

    protected setNextProvider(p: AuthProviders) {
        logger.log('next provider =>', p);
        this._nextProvider = p;
    }

    protected async hasUserRole(email: string): Promise<boolean> {
        try {
            const data = await Firebase.Instance.getFunction(UsersFunctions.CheckRole)
                .execute({ email: prepareEmail(email) , role: this.targetRole });

            return data && data.result;
        } catch (err) {
            logger.warn('[hasUserRole]', err);
            throw err;
        }
    }

    public async hasAccount(email: string): Promise<boolean> {
        try {
            const data = await Firebase.Instance.getFunction(UsersFunctions.HasAccount)
                .execute({ email: prepareEmail(email) });
            logger.warn('[UsersFunctions.HasAccount]', data);
            return data && data.result;
        } catch (err) {
            logger.warn('[HasAccount]', err);
            throw err;
        }
    }

    async getEmailAuthMethod(email: string): Promise<AuthProviders[]> {
        const methods = await Firebase.Instance.auth.fetchSignInMethodsForEmail(email);
        const results = (methods || []).map(m => {
            switch (m) {
                case Firebase.Instance.FirebaseAuth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD: {
                    return AuthProviders.EmailAndPassword;
                }

                case Firebase.Instance.FirebaseAuth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD: {
                    return AuthProviders.EmailLink;
                }

                case Firebase.Instance.FirebaseAuth.GoogleAuthProvider.PROVIDER_ID: {
                    return AuthProviders.Google;
                }

                default: {
                    return null;
                }
            }
        }).filter(m => m);

        if (results.length === 0) {
            logger.log('No auth methods for email', email, '; existing are:', methods);
        }

        return results;
    }

    getHasAccount(email: string): Promise<boolean> {
        return this.hasUserRole(email);
    }

    abstract async signInWithEmailLink(email: string, reason: MagicLinkRequestReasons): Promise<void>;

    async validateCode(email: string, code: string): Promise<{ result: boolean }> {
        const data = await Firebase.Instance.getFunction(UsersFunctions.ValidateCode)
            .execute({ email, code });
        return data;
    }

    async resetPassword(email: string, newPassword: string): Promise<{ result: boolean }> {

        const data = await Firebase.Instance.getFunction(UsersFunctions.ResetPassword)
            .execute({ email, newPassword });

        if (data.result) {
            const signInResult = await Firebase.Instance.auth.signInWithEmailAndPassword(email, newPassword);
            if (signInResult) {
                this._setPasswordMode = false;
                return { result: true };
            }
        }

        return { result: false };
    }

    async createAccountForEmailAfterVerificationCode(email: string): Promise<{ result: boolean }> {
        const data = await Firebase.Instance.getFunction(UsersFunctions.CheckInvite)
            .execute({ email: email, key: null, role: UserRoles.Client, useVerificationCode: true });
        if (data.result && data.token) {
            logger.log('checkForInviteSignIn: signing in with generated token...');
            try {
                this.setNextProvider(AuthProviders.EmailLink);
                await Firebase.Instance.auth.signInWithCustomToken(data.token);
            } catch (err) {
                this.setNextProvider(null);
                logger.log('checkForInviteSignIn: failed to sign in with generated token, error:', err);
                return { result: false };
            }
        }
        return data;
    }

    async sendVerificationCodeByEmail(email: string): Promise<{ result: boolean } | 'noInvitation'> {
        email = prepareEmail(email);
        logger.log('sendVerificationCodeByEmail', email);

        // don't use Promise.all here – it crashes Expo
        await this.Storage.setValue(UserSignInEmailStorageKey, email);
        await this.Storage.remove(PasswordResetRequestedKey);

        const data = await Firebase.Instance.getFunction(UsersFunctions.SendVerificationCodeEmail)
            .execute({ email: prepareEmail(email) });

        return data;
    }

    protected async sendMagicLinkRequest(email: string, reason: MagicLinkRequestReasons, displayName?: string) {
        email = prepareEmail(email);
        logger.log('sendMagicLinkRequest', email, reason);

        // don't use Promise.all here – it crashes Expo
        await this.Storage.setValue(UserSignInEmailStorageKey, email);
        await this.Storage.setValue(MagicLinkReasonKey, reason || 'empty');
        await this.Storage.remove(PasswordResetRequestedKey);

        const res = await Firebase.Instance.getFunction(UsersFunctions.GenerateMagicLink)
            .execute({
                email: email,
                role: this.targetRole,
                continueUrl: this.locationUrl,
                reason,
                fullname: displayName,
            });

        const actionCodeSettings = {
            handleCodeInApp: true,
            url: res.magicLink,
            android: { packageName: ClientSettings.mobile.android, installApp: true },
            iOS: { bundleId: ClientSettings.mobile.ios },
        };

        await Firebase.Instance.auth.sendSignInLinkToEmail(email, actionCodeSettings);

        return { result: true, error: '' };
    }

    protected async processEmailLink(): Promise<{ result?: true, error?: 'invalidLink' | 'noemail' | Error, email?: string }> {
        let email = await this.Storage.getValue(UserSignInEmailStorageKey);
        const url = this.locationUrl;
        try {
            if (!Firebase.Instance.auth.isSignInWithEmailLink(url)) {
                logger.log('Current path is not sign in link:', url);
                return { error: 'invalidLink' };
            }

            email = prepareEmail(email);
            if (!email) {
                logger.log('User was not performing a sign in');
                return { error: 'noemail' };
            }

            this.setNextProvider(AuthProviders.EmailLink);
            await Firebase.Instance.auth.signInWithEmailLink(email, url);

            const reason = await this.Storage.getValue(MagicLinkReasonKey) as MagicLinkRequestReasons;
            this.logger.log('processEmailLink reason =', reason);
            if (reason === MagicLinkRequestReasons.PasswordReset) {
                await this.Storage.setValue(PasswordResetRequestedKey, 'true');
                this._setPasswordMode = true;
            }

            await this.Storage.remove(MagicLinkReasonKey);
            await this.Storage.remove(UserSignInEmailStorageKey);

            this.logger.log('processEmailLink succeed with reason =', reason);
            this._magicLinkSucceeded.trigger(reason);

            return { result: true };

        } catch (err) {
            this.setNextProvider(AuthProviders.None);
            logger.error('Failed to perform a sign in for user:', email, '; Error:', err);
            return {
                error: err,
                email,
            };
        }
    }

    async signInWithEmailPassword(email: string, password: string): Promise<void> {
        const e = prepareEmail(email);

        try {
            this.setNextProvider(AuthProviders.EmailAndPassword);
            await Firebase.Instance.auth.signInWithEmailAndPassword(e, password);
            await this.Storage.remove(PasswordResetRequestedKey);
        } catch (err) {
            this.setNextProvider(AuthProviders.None);
            throw err;
        }
    }

    async createAccountForEmailAndPassword(email: string, password: string): Promise<void> {
        if (!process.appFeatures.MOBILE_STANDALONE) {
            throw new Error('Registration with email/password is not allowed');
        }

        const e = prepareEmail(email);
        logger.log('Creating an account for ', e);
        try {
            this.setNextProvider(AuthProviders.EmailAndPassword);
            await Firebase.Instance.auth.createUserWithEmailAndPassword(e, password);
        } catch (err) {
            this.setNextProvider(AuthProviders.None);
            throw err;
        }
    }

    async signInWithEmailOnly(email: string): Promise<{ result: boolean }> {
        const data = await Firebase.Instance.getFunction(UsersFunctions.GenerateToken)
            .execute({ email });

        if (!data || !data.result || !data.token) {
            return { result: false };
        }

        const res = await Firebase.Instance.auth.signInWithCustomToken(data.token);

        if (!res) {
            return { result: false };
        }

        return { result: true };
    }

    async updatePassword(password: string, oldPassword?: string): Promise<AuthResult> {
        const authUser = Firebase.Instance.auth.currentUser;
        if (!authUser) {
            return { result: false, error: AuthErrors.InvalidAuthState, original: null };
        }

        try {
            await authUser.updatePassword(password);
            logger.log('password updated successfuly!!');
            this._authUser.providers = await this.getEmailAuthMethod(authUser.email);
            this._setPasswordMode = false;
            await this.Storage.remove(PasswordResetRequestedKey);

            return { result: true };
        } catch (err) {
            logger.log('failed to update password:', err.code);
            if (err.code === 'auth/requires-recent-login') {
                if (oldPassword) {
                    const cred = Firebase.Instance.FirebaseAuth.EmailAuthProvider.credential(this.authUser.email, oldPassword);
                    try {
                        logger.log('re-authenticating with email/password for', this.authUser.email);
                        await authUser.reauthenticateWithCredential(cred);
                    } catch (err2) {
                        logger.log('failed to re-authenticate, ERROR:', err2);
                        return {
                            result: false,
                            error: err2.code === 'auth/wrong-password'
                                ? AuthErrors.WrongPassword
                                : AuthErrors.InvalidAuthState,
                            original: err2,
                        };
                    }

                    return await this.updatePassword(password);
                }

                return {
                    result: false,
                    error: AuthErrors.NeedsReauthentication,
                    original: err,
                };
            } else {
                throw err;
            }
        }
    }

    async updatePasswordWithEmail(email: string, password: string, oldPassword?: string): Promise<AuthResult> {
        const authUser = Firebase.Instance.auth.currentUser;
        if (!authUser) {
            // This code should only be reached when using verification code to login
            const res = await this.signInWithEmailOnly(email);
            if (!res || res.result) {
                return { result: false, error: AuthErrors.InvalidAuthState, original: null };
            }
        }

        try {
            await authUser.updatePassword(password);
            logger.log('password updated successfuly!!');
            this._authUser.providers = await this.getEmailAuthMethod(authUser.email);
            this._setPasswordMode = false;
            await this.Storage.remove(PasswordResetRequestedKey);
            return { result: true };
        } catch (err) {
            logger.log('failed to update password:', err.code);
            if (err.code === 'auth/requires-recent-login') {
                if (oldPassword) {
                    const cred = Firebase.Instance.FirebaseAuth.EmailAuthProvider.credential(this.authUser.email, oldPassword);
                    try {
                        logger.log('re-authenticating with email/password for', this.authUser.email);
                        await authUser.reauthenticateWithCredential(cred);
                    } catch (err2) {
                        logger.log('failed to re-authenticate, ERROR:', err2);
                        return {
                            result: false,
                            error: err2.code === 'auth/wrong-password'
                                ? AuthErrors.WrongPassword
                                : AuthErrors.InvalidAuthState,
                            original: err2,
                        };
                    }

                    return await this.updatePassword(email, password);
                }

                return {
                    result: false,
                    error: AuthErrors.NeedsReauthentication,
                    original: err,
                };
            } else {
                throw err;
            }
        }
    }

    protected doGoogleSignIn() {
        const provider = new Firebase.Instance.GoogleProvider();
        return Firebase.Instance.auth.signInWithPopup(provider);
    }

    async signInWithGoogle(): Promise<boolean> {
        try {
            this.setNextProvider(AuthProviders.Google);

            const result = await this.doGoogleSignIn();
            if (!result) {
                logger.warn('Google SignIn: no result (probably canceled)');
                this.setNextProvider(AuthProviders.None);
                return false;
            }

            logger.log('Google: Successfully signed in with user', result.user.email);

            // not necessary to init because onAuthStateChanged should be triggered
            // await this.init();
            return true;
        } catch (err) {
            this.setNextProvider(AuthProviders.None);

            // tslint:disable-next-line: triple-equals
            if (err.code == '-3' || (err.message && err.message.includes('error -3'))) {
                logger.log('Cancel sign in with google');
                return false;
            }

            logger.warn('Google Sign in error:', err.message, err);

            // Handle Errors here.
            const errorCode: string = err.code;
            const errorMessage = err.message;
            // The email of the user's account used.
            const email = err.email;
            // The firebase.auth.AuthCredential type that was used.
            // const credential = err.credential;

            if (errorCode === 'auth/account-exists-with-different-credential') {
                // Construct the email link credential from the current URL.
                const emailCredential = Firebase.Instance.FirebaseAuth.EmailAuthProvider.credentialWithLink(
                    email, this.locationUrl);

                // Link the credential to the current user.
                try {
                    const usercred = await Firebase.Instance.auth.currentUser.linkWithCredential(emailCredential);
                    // The provider is now successfully linked.
                    // The phone user can now sign in with their phone number or email.
                    return false;

                } catch (innerErr) {
                    // Some error occurred.
                }
            }
            throw err;
        }
    }

    async signOut() {
        logger.log('Signing out...');
        this.doInitialization(async () => {
            try {
                this._setPasswordMode = false;

                await this._onSignOut.triggerAsync();

                await this.servicesSignOut();

                await this.Storage.remove(AuthProviderIdKey);
                await this.Storage.remove(MagicLinkReasonKey);

                await Firebase.Instance.auth.signOut();
            } catch (err) {
                logger.warn('Failed to sign out!');
                console.error(err);
                throw err;
            }
        });
    }

    protected abstract async googleSignOut(): Promise<void>;

    protected async servicesSignOut() {
        await this.googleSignOut();
    }

    devLogin(email: string): Promise<void> {
        return this.doInitialization(async () => {
            const res = await Firebase.Instance.getFunction(UsersFunctions.ForceLogin)
                .execute({ email });

            if (res && res.token) {
                this.setNextProvider(AuthProviders.DevLogin);
                await Firebase.Instance.auth.signInWithCustomToken(res.token);
            }
        });
    }

    async updatePhotoUrl(photoUrl: string): Promise<void> {
        await Firebase.Instance.auth.currentUser.updateProfile({
            photoURL: photoUrl,
        });

        this._authUser.photoURL = Firebase.Instance.auth.currentUser.photoURL;
        logger.log('User photo URL updated:', this._authUser.photoURL);
    }

    protected async doInitialization<T>(cb: () => Promise<T>): Promise<T> {
        try {
            this._initializing++;
            const res = await cb();
            return res;
        } finally {
            this._initializing--;
        }
    }
}
