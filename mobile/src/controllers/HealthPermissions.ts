import { observable } from 'mobx';

import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import { auth, initHealthKit, disconnectAndroid, getDOB, getAuthStatus, checkForStepsData, checkForSleepData } from 'src/helpers/health'
import { Platform } from 'react-native';
import logger from 'common/logger';


export class HealthPermissionsController implements IDisposable {

    @observable
    private _enabledByUser: boolean;

    @observable
    private _enabledByUserOriginal: boolean;

    private _permissionsAsked: boolean = false;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    constructor(private readonly settings: ILocalSettingsController) {
    }

    public get enabledOG() { return this._enabledByUserOriginal; }

    public get permissionsGranted() { return this._enabledByUser; }

    public get permissionsAsked() { return this._permissionsAsked; }

    // Should be OK to call multiple times
    async initAsync() {
        this._permissionsAsked = !!this.settings.current.healthPermissions?.seenPermissionPromptIOS;
        this._enabledByUser = Platform.OS == 'ios' ? (this.permissionsAsked && await this.checkForIOSHealthData()) : this.settings.current.healthPermissions?.enabledAndroid;
    }

    public askPermission = async () => {
        if (Platform.OS == 'ios') {
            await initHealthKit();
            this.settings.updateHealthPermissions({
                seenPermissionPromptIOS: true,
                enabledAndroid: false,
            });
            await this.initAsync();
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

    private async checkForIOSHealthData(): Promise<boolean> {
        return await checkForStepsData() || await getDOB() || await checkForSleepData();
    }

    private sync = async () => {
        this.settings.updateHealthPermissions({
            enabledAndroid: this._enabledByUser,
        });
    }

    dispose() {
    }
}