import { observable } from 'mobx';
import { IUserNameProvider } from 'src/services/Notifications';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import { auth, init, disconnectAndroid, getDOB, getAuthStatus } from 'src/helpers/health'
import { Platform } from 'react-native';
import logger, { createLogger } from 'common/logger';


export class HealthPermissionsController implements IDisposable {

    @observable
    private _enabledByUser: boolean;

    @observable
    private _enabledByUserOriginal: boolean;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    constructor(private readonly settings: ILocalSettingsController, name: IUserNameProvider) {
    }

    public get enabled() { return this._enabledByUser; }

    public get enabledOG() { return this._enabledByUserOriginal; }

    public get permissionsGranted() { return this._enabledByUser; }

    public get permissionsAsked() { return this._enabledByUser != null; }

    // Should be OK to call multiple times
    async initAsync() {
        this._enabledByUser = this.settings.current.health?.enabledAndroid;
    }

    public askPermission = async () => {
        if (Platform.OS == 'ios') {
            await init();
            this.settings.updateHealthPermissions({
                seenPermissionPromptIOS: true,
                enabledAndroid: false,
            });
        } else if (Platform.OS == 'android') {
            const authorized = await auth();
            logger.log("PERMS", authorized);
            this._enabledByUserOriginal = authorized;
            this._enabledByUser = authorized;

            await this.sync();
        }

        return this.permissionsGranted;
    }

    public disableHealthPermissions = async () => {
        if (Platform.OS == 'android') {
            disconnectAndroid();
        }

        this._enabledByUser = false;
        this._syncThrottle.tryRun(this.sync);

        return false;
    }

    private sync = async () => {
        this.settings.updateHealthPermissions({
            enabledAndroid: this._enabledByUser,
        });
    }

    dispose() {
    }
}