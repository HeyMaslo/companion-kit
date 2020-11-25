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
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
  } from '@react-native-community/google-signin';


export interface IAuthController extends IAuthControllerBase {
    readonly appleSignInSupported: boolean;

    signInWithApple(): Promise<boolean>;
}

const UseNativeGoogle = ExpoConstants.appOwnership === AppOwnership.Standalone;

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
    // <------- ADDED THIS NOV 22-------------------------- /
    //   }

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

    // < ----------- NEW CODE ------------

    //< ******************************____________________**********************________________________************************___________________
    //< ******************************____________________**********************________________________************************___________________
    //< ******************************____________________**********************________________________************************___________________

    async initGoogle() {
        if (UseNativeGoogle) {
            try {
                await GoogleSignInNative.initAsync();
            } catch (err) {
                logger.error('Failed to initialize GoogleSignIn:', err.message, err);
            }
        }
    }
// <--------- Google signin agaoin
    protected async doGoogleSignIn() {
        GoogleSignin.configure({
            scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
            webClientId: '702170362360-s3jqiaa6o3plafigsmpugbroijh2ctph.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
            offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
            // hostedDomain: '', // specifies a hosted domain restriction
            // loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
            forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
            // accountName: '', // [Android] specifies an account name on the device that should be used
            // iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
          });

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
            logger.log('ENV GOOGLE = ', Env.Google);
            logger.log('ENV = ', Env);
            // logger.log('CHECK CHECK', ExpoConstants.appOwnership);
            // const value = getGooglefitData();702170362360-s3jqiaa6o3plafigsmpugbroijh2ctph.apps.googleusercontent.com
            // logger.log('IN AUTH', value);

            //< -----------------ACTUAL LOGIN ----------------- ------------- ---------------------- - ---------------------- - --------------- - ----- >/

            // const signIn = async () => {
            //     logger.log("IN SIGNIN ASYNC")
            //     try {
            //       await GoogleSignin.hasPlayServices();
            //       const userInfo = await GoogleSignin.signIn();
            //       return userInfo;
            //     } catch (error) {
            //       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            //         logger.log('ERROR IN SIGN IN ASYNC', 'user cancelled the login flow')
            //         // user cancelled the login flow
            //       } else if (error.code === statusCodes.IN_PROGRESS) {
            //         logger.log('ERROR IN SIGN IN ASYNC', 'is in progress already')
            //         // operation (e.g. sign in) is in progress already
            //       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            //         logger.log('ERROR IN SIGN IN ASYNC', 'play services not available or outdated')
            //         // play services not available or outdated
            //       } else {
            //         logger.log('ERROR IN SIGN IN ASYNC', error)
            //         // some other error happened
            //       }
            //     }
            //   };

              const res = await GoogleSignin.getTokens();



            // const res = await GoogleExpo.logInAsync({
            //     // iosClientId: Env.Google.ExpoClientIdIOS,
            //     androidClientId: Env.Google.ExpoClientIdAndroid,
            //     clientId: '702170362360-fhf36qta6mqegj5a027oiiinsb9cdnc6.apps.googleusercontent.com',
            //     // webClientId: Env.Google.ExpoClientIdAndroid,
            // } as GoogleExpo.GoogleLogInConfig);

            // logger.log('RESULT FROM LOGINASYNCH',res)

            // if (res.type === 'success') {
            //     result = {
            //         idToken: res.idToken,
            //         accessToken: res.accessToken,
            //     };
            // }

            logger.log('user_info', res)
            if (res) {
                result = {
                    idToken: res.idToken,
                    accessToken: res.serverAuthCode,
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

    //< ******************************____________________**********************________________________************************___________________
    //< ******************************____________________**********************________________________************************___________________
    //< ******************************____________________**********************________________________************************___________________

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
