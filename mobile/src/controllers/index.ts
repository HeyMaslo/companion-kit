import { Alert } from 'react-native';
import { observable, transaction } from 'mobx';
import * as ExpoUpdates from 'expo-updates';
import Lazy from 'common/utils/lazy';
import { IAuthController, AuthController } from './Auth';
import { IUserController, UserController } from './User';
import {
    IStorageController,
    StorageController,
} from 'common/controllers/StorageController';
import PromptModalViewModel from 'common/viewModels/PromptModalViewModel';
import { AppVersion } from './AppVersion';
import Analytics from 'common/services/analytics/analytics';
import { GlobalTriggers, GlobalTrigger } from 'src/stateMachine/globalTriggers';
import Localization from 'src/services/localization';
import { createLogger, addGlobalLoggerErrorHook } from 'common/logger';
import Firebase from 'common/services/firebase';

export interface IAppController {
    readonly Auth: IAuthController;
    readonly User: IUserController;
    readonly Storage: IStorageController;
    readonly PromptModal: PromptModalViewModel;

    readonly isAppActive: boolean;
    readonly loading: boolean;

    readonly version: AppVersion;

    setAppActive: (value: boolean) => void;
}

const logger = createLogger('[AppController]');
const _instance = new Lazy(() => new AppController());

addGlobalLoggerErrorHook((e) => AppController.captureError(e, false));

export default class AppController implements IAppController {
    static get Instance(): IAppController {
        return _instance.value;
    }

    readonly auth = new AuthController();
    readonly user = new Lazy(() => new UserController(this.auth));
    readonly promptModal = new Lazy(() => new PromptModalViewModel());

    readonly version = new AppVersion();

    @observable
    private _isAppActive: boolean = false;

    constructor() {
        this.auth.onSignOut.on(this.onSignOut);
    }

    get Auth(): IAuthController {
        return this.auth;
    }
    get User(): IUserController {
        return this.user.value;
    }
    get Storage(): IStorageController {
        return StorageController.Instance;
    }
    get PromptModal(): PromptModalViewModel {
        return this.promptModal.value;
    }

    get loading() {
        return this.auth.initializing || this.user.value.initializing;
    }

    private onSignOut = async () => {
        logger.log('SIGN OUT: invalidating token...');
        await this.User?.notifications.invalidateToken();
        await this.User?.localSettings?.flushChanges();

        logger.log('SIGN OUT: VIEW sign out...');
        // unmounts views/viewmodels
        GlobalTrigger(GlobalTriggers.SignOut);

        // incl. unsubscribe all DB listeners
        logger.log('SIGN OUT: Disposing Controllers...');
        this.dispose();
    };

    private dispose = () => {
        transaction(() => {
            this.user.value.dispose();
            this.user.reset();
            this.user.prewarm();
        });
    };

    get isAppActive() {
        return this._isAppActive;
    }

    public setAppActive(value: boolean) {
        if (this._isAppActive === value) {
            return;
        }

        this._isAppActive = value;
        if (value) {
            this.onAppBecameActive();
        } else {
            this.onAppBecameInactive();
        }
    }

    private async onAppBecameActive() {
        this.version.checkForUpdates();

        if (this.User && this.User.user) {
            await this.User.notifications.initAsync();
        }

        // force reconnect to the database
        if (Firebase.isInitialized) {
            logger.log('Firebase: enabling network');
            await Firebase.Instance.database.enableNetwork();
        }
    }

    private async onAppBecameInactive() {
        this.User?.localSettings?.flushChanges();

        if (Firebase.isInitialized) {
            logger.log('Firebase: disabling network');
            await Firebase.Instance.database.disableNetwork();
        }
    }

    static captureError(e: Error, fatal = true): void {
        Analytics.Current?.trackError(e);

        if (fatal) {
            Alert.alert(
                'Unknown error',
                `Something went wrong. Please send the screenshot of this screen to ${Localization.Current.MobileProject.contactEmail}.\r\n` +
                    e,
                // + Object.keys(e).map(k => `${k} => ${e[k]}`).join('\r\n')
                [{ text: 'OK', onPress: ExpoUpdates.reloadAsync }],
            );
        }
    }
}
