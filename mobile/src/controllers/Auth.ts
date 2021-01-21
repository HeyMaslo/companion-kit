import * as GoogleExpo from 'expo-google-app-auth';
import * as GoogleSignInNative from 'expo-google-sign-in';
import ExpoConstants, { AppOwnership } from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Alert } from 'react-native';
import { reaction } from 'mobx';
import { asyncComputed } from 'computed-async-mobx';
import { sha256 } from 'js-sha256';

import Firebase from 'common/services/firebase';
import StorageAsync from 'src/services/StorageAsync';
import { IAuthController as IAuthControllerBase, AuthProviders } from 'common/abstractions/controlllers/IAuthController';
import AuthControllerBase, { logger } from 'common/controllers/AuthController';
import { UserRoles } from 'common/models';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import Env from 'src/constants/env';
import MobileTracker from 'src/services/mobileTracker';
import * as Events from 'src/services/mobileTracker.events';
import AppQueryService, { AppQueryParameters } from 'src/services/AppQueryService';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';
import * as Features from 'common/constants/features';

export interface IAuthController extends IAuthControllerBase {
    readonly appleSignInSupported: boolean;

    signInWithApple(): Promise<boolean>;
}

const UseNativeGoogle = AppOwnership.Standalone;

export class AuthController extends AuthControllerBase implements IAuthController {

    private _locationUrl: string = '';
    private readonly _appleSignInSupported = Features.Mobile.SignIn.Apple
        ? asyncComputed(false, 0, () => AppleAuthentication.isAvailableAsync())
        : null;

    constructor() {
        super();

        this.initGoogle();

        reaction(
            () => AppQueryService.Instance.currentUrl,
            () => this.updateLocationUrl(AppQueryService.Instance.currentUrl, AppQueryService.Instance.query),
            { fireImmediately: true, delay: 100 },
        );
    }

    get appleSignInSupported() {
        // return false;
        return this._appleSignInSupported && this._appleSignInSupported.get();
    }
    get targetRole() { return UserRoles.Client; }
    get locationUrl() { return this._locationUrl; }

    get Storage() { return StorageAsync; }

    async signInWithEmailLink(email: string, reason: MagicLinkRequestReasons): Promise<void> {
        // this._locationUrl = process.appLinks.authMagicLink;

        const res = await this.sendMagicLinkRequest(email, reason);

        if (res.result) {
            MobileTracker.Instance?.trackEvent(Events.Login);
        }

        if (!res.result && res.error) {
            throw new Error(res.error);
        }
    }

    private updateLocationUrl = async (url: string, parsed: AppQueryParameters): Promise<boolean> => {
        if (!url) {
            return;
        }

        this._locationUrl = url;

        const showInvalidAuthAlert = (str?: string) => Alert.alert(
            'Warning',
            'There was a problem during sign in with a Magic Link.\r\n' +
            'Please try again but make sure you\'re using a link from the freshest email we will send you.\r\n' +
                (str ? ('\r\nError details: ' + str) : ''),
        );

        await this.doInitialization(async () => {
            const res = await this.processEmailLink();

            if (res.error === 'invalidLink') {
                if (parsed.oobCode) {
                    showInvalidAuthAlert('email link looks corrupted.');
                }
                await this.checkForInviteSignIn();
                return;
            }

            if (res.error === 'noemail') {
                showInvalidAuthAlert('sign in was not initiated properly.');
                return;
            }

            if (res.error) {
                showInvalidAuthAlert(`[${res.email || '?'}]: ${JSON.stringify(res.error.message)}`);
                return false;
            }
        });
    }

    private async checkForInviteSignIn() {
        const { e: email, k: key } = AppQueryService.Instance.query?.appParams || {};
        logger.log('checkForInviteSignIn email =', email, '; key =', key);
        if (email && key) {
            const data = await Firebase.Instance.getFunction(UsersFunctions.CheckInvite)
                .execute({ email: email, key: key, role: this.targetRole });

            if (data.result && data.token) {
                logger.log('checkForInviteSignIn: signing in with generated token...');
                try {
                    this.setNextProvider(AuthProviders.EmailLink);
                    await Firebase.Instance.auth.signInWithCustomToken(data.token);
                } catch (err) {
                    this.setNextProvider(null);
                    logger.log('checkForInviteSignIn: failed to sign in with generated token, error:', err);
                }
            }
        }
    }

    async initGoogle() {
        if (UseNativeGoogle) {
            try {
                await GoogleSignInNative.initAsync();
            } catch (err) {
                logger.error('Failed to initialize GoogleSignIn:', err.message, err);
            }
        }
    }

    protected async doGoogleSignIn() {
        let result: { idToken: string, accessToken: string };
        if (UseNativeGoogle) {
            await GoogleSignInNative.askForPlayServicesAsync();
            const res = await GoogleSignInNative.signInAsync();
            if (res.type === 'success') {
                result = {
                    idToken: res.user.auth.idToken,
                    accessToken: res.user.auth.accessToken,
                };
            }
        } else {
            logger.log('Sign in with Google, client id = ', Env.Google.ExpoClientIdIOS, Env.Google.ExpoClientIdAndroid);
            const res = await GoogleExpo.logInAsync({
                iosClientId: Env.Google.ExpoClientIdIOS,
                androidClientId: Env.Google.ExpoClientIdAndroid,
            } as GoogleExpo.GoogleLogInConfig);

            if (res.type === 'success') {
                result = {
                    idToken: res.idToken,
                    accessToken: res.accessToken,
                };
            }
        }

        if (!result) {
            return null;
        }

        const creds = Firebase.Instance.GoogleProvider.credential(result.idToken, result.accessToken);
        const authResult = await Firebase.Instance.auth.signInWithCredential(creds);

        MobileTracker.Instance?.trackEvent(Events.Login);

        return authResult;
    }

    async signInWithApple(): Promise<boolean> {
        return this.doInitialization(async () => {
            try {
                this.setNextProvider(AuthProviders.Apple);
                const rawNonce = (Date.now() * Math.random()).toString(36);

                const credential = await AppleAuthentication.signInAsync({
                    requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                        AppleAuthentication.AppleAuthenticationScope.EMAIL,
                    ],
                    nonce: sha256(rawNonce),
                });

                const authCredential = new Firebase.Instance.FirebaseAuth.OAuthProvider('apple.com')
                    .credential({
                        idToken: credential.identityToken,
                        rawNonce: rawNonce,
                    });

                try {
                    await Firebase.Instance.auth.signInWithCredential(authCredential);
                } catch (e) {
                    logger.error(e);
                    throw e;
                }

                // signed in
                logger.log('APPLE SIGN IN RESULT:', credential);

                return true;
            } catch (e) {
                this.setNextProvider(AuthProviders.None);

                if (e.code === 'ERR_CANCELED') {
                    // handle that the user canceled the sign-in flow
                    logger.warn('user canceled the sign-in flow:', e);
                } else {
                    // handle other errors
                    logger.warn('APPLE SIGN IN ERROR:', e);
                }

                return false;
            }
        });
    }

    protected async servicesSignOut() {
        await super.servicesSignOut();
    }

    protected async googleSignOut() {
        if (UseNativeGoogle) {
            await GoogleSignInNative.signOutAsync();
        }
    }
}
