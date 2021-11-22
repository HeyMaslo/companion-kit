import { observable } from 'mobx';
import { IUserNameProvider } from 'src/services/Notifications';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import { authAndroid, initHealthKit, disconnectAndroid, getDOB, getAuthStatus, checkForStepsData, checkForSleepData } from 'src/helpers/health'
import { Platform } from 'react-native';
import logger from 'common/logger';


export class HealthPermissionsController implements IDisposable {

    @observable
    private _enabledByUser: boolean;

    @observable
    private _enabledByUserOriginal: boolean;

    private _permissionsAsked: boolean = false;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    constructor(private readonly settings: ILocalSettingsController, name: IUserNameProvider) {
    }

    public get enabled() { return this._enabledByUser; }

    public get enabledOG() { return this._enabledByUserOriginal; }

    public get permissionsGranted() { return this._enabledByUser; }

    public get permissionsAsked() { return this._permissionsAsked; }

    // Should be OK to call multiple times
    async initAsync() {
        this._permissionsAsked = !!this.settings.current.health?.seenPermissionPromptIOS;
        this._enabledByUser = Platform.OS == 'ios' ? (this.permissionsAsked && await this.checkForIOSHealthData()) : this.settings.current.health?.enabledAndroid;
    }

    public askPermission = async () => {
        if (Platform.OS == 'ios') {
            await initHealthKit();
            this.settings.updateHealthPermissions({
                seenPermissionPromptIOS: true,
            });
            await this.initAsync();
        } else if (Platform.OS == 'android') {
            const isAuthorized = await authAndroid();
            logger.log("GOOGLE_FIT_PERMS", isAuthorized);
            
            this._enabledByUserOriginal = isAuthorized;
            this._enabledByUser = isAuthorized;
            await this.sync();
        }

        return this.permissionsGranted;
    }

    public disableHealthPermissions = () => {
        if (Platform.OS == 'android') {
            disconnectAndroid();
        }

        this._enabledByUser = false;
        this._syncThrottle.tryRun(this.sync);

        return false;
    }

    private async checkForIOSHealthData(): Promise<boolean> {
        return await checkForStepsData() || await getDOB() || await checkForSleepData();
    }

    private sync = async () => {
        this.settings.updateHealthPermissions({
            enabledAndroid: this._enabledByUser,
        });
    }    dispose() {
    }
}