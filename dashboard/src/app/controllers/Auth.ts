import Storage, { StorageAsync } from 'app/services/Storage';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import { UserProfile, ICoachSignUpData, UserRoles, CoachProfile } from 'common/models';
import Identify from 'common/models/Identify';
import { prepareEmail } from 'common/utils/emails';
import { IAuthController as IAuthControllerBase } from 'common/abstractions/controlllers/IAuthController';
import AuthControllerBase, { logger } from 'common/controllers/AuthController';
import Firebase from 'common/services/firebase';
import WebClientTracker, { Events } from 'app/services/webTracker';
import { MagicLinkRequestReasons } from 'common/models/dtos/auth';
import History from 'app/services/history';

export type CoachUser = Identify<UserProfile> & { coach?: CoachProfile };

export interface IAuthController extends IAuthControllerBase {
    readonly signinUserEmail: string;

    signUp(data: ICoachSignUpData): Promise<'magicLink' | 'finish'>;
    enableCreatePasswordMode(): void;
}

const UserSignInEmailSotrageKey = 'auth:signin:email';
const UserSignUpDataStorageKey = 'auth:signup:data';

export class AuthController extends AuthControllerBase implements IAuthController {
    constructor() {
        super();

        this.doInitialization(this.checkLocation);
    }

    get targetRole() { return UserRoles.Coach; }
    get signinUserEmail() { return Storage.getValue(UserSignInEmailSotrageKey); }
    get locationUrl() { return window.location.href; }

    get Storage() { return StorageAsync; }

    async signUp(data: ICoachSignUpData): Promise<'magicLink' | 'finish'> {
        if (this.authUser) {
            data.email = prepareEmail(data.email);

            // already signed up, just create/update user
            await this.doInitialization(() => this.createCoachUser(data));

            WebClientTracker.Instance?.trackEvent(Events.Signup);

            return 'finish';
        } else {
            // this step is just the same as for SignIn, so re-using...
            await this.sendMagicLinkRequest(data.email, MagicLinkRequestReasons.SignUp, data.displayName);
            Storage.setValue(UserSignUpDataStorageKey, JSON.stringify(data));

            return 'magicLink';
        }
    }

    private async createCoachUser(signupData: ICoachSignUpData) {
        const password = signupData.password;
        delete signupData.password;

        const result = await Firebase.Instance.getFunction(UsersFunctions.CreateCoachUser)
            .execute(signupData);

        if (result && password) {
            logger.log('Updating password for new coach user...');
            try {
                await this.updatePassword(password);
            } catch (err) {
                logger.error('Failed to update password. ERROR:', err);
            }
        }

        await this.processAuthUser();
    }

    public enableCreatePasswordMode(): void {
        this.forceEnableSetPasswordMode();
    }

    async signInWithEmailLink(email: string, reason: MagicLinkRequestReasons) {
        const res = await this.sendMagicLinkRequest(email, reason);
        if (!res.result && res.error) {
            throw new Error(res.error);
        }
    }

    private checkLocation = () => {
        return this.doInitialization(async () => {
            const res = await this.processEmailLink();
            if (!res || !res.result) {
                return false;
            }

            WebClientTracker.Instance?.trackEvent(Events.Login);

            const data = Storage.getValue(UserSignUpDataStorageKey);
            if (data) {
                Storage.removeValue(UserSignUpDataStorageKey);

                const signupData = JSON.parse(data) as ICoachSignUpData;

                await this.createCoachUser(signupData);

                WebClientTracker.Instance?.trackEvent(Events.Signup);
            }

            History.replace('/');

            return true;
        });
    }

    async signInWithGoogle(): Promise<boolean> {
        const result = await super.signInWithGoogle();

        if (result) {
            WebClientTracker.Instance?.trackEvent(Events.Login);
        }

        return result;
    }

    protected async googleSignOut() {
        // don't need this in web
    }

    async signOut() {
        WebClientTracker.Instance?.trackEvent(Events.Logout);

        await super.signOut();
    }
}
