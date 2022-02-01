import { observable } from 'mobx';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import { authAndroid, initHealthKit, disconnectAndroid, getDOB, getAuthStatus, checkForStepsData, checkForSleepData } from 'src/helpers/health'
import { Platform } from 'react-native';
import logger from 'common/logger';
import AppController from '.';

export class HealthPermissionsController implements IDisposable {

    @observable
    private _enabledByUser: boolean;

    @observable
    private _enabledByUserOriginal: boolean;

    private _permissionsAsked: boolean = false;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    public get enabled() { return this._enabledByUser; }

    public get enabledOG() { return this._enabledByUserOriginal; }

    public get permissionsGranted() { return this._enabledByUser; }

    public get permissionsAsked() { return this._permissionsAsked; }

    // Should be OK to call multiple times
    async initAsync() {
        this._permissionsAsked = !!AppController.Instance.User?.localSettings.current.healthPermissions?.seenPermissionPromptIOS;
        this._enabledByUser = Platform.OS == 'ios' ? (this.permissionsAsked && await this.checkForIOSHealthData()) : AppController.Instance.User?.localSettings.current.healthPermissions?.enabledAndroid;
    }

    public askPermission = async () => {
        if (Platform.OS == 'ios') {
            await initHealthKit();
            await this.syncSettings();
            await this.initAsync();
        } else if (Platform.OS == 'android') {
            const isAuthorized = await authAndroid();
            this._enabledByUserOriginal = isAuthorized;
            this._enabledByUser = isAuthorized;
            await this.syncSettings();
        }

        return this.permissionsGranted;
    }

    public disableHealthPermissions = () => {
        if (Platform.OS == 'android') {
            disconnectAndroid();
        }

        this._enabledByUser = false;
        this._syncThrottle.tryRun(this.syncSettings);

        return false;
    }

    private async checkForIOSHealthData(): Promise<boolean> {
        return await checkForStepsData() || await getDOB() || await checkForSleepData();
    }

    private syncSettings = async () => {
        const diff = Platform.OS == 'ios' ?
            { seenPermissionPromptIOS: true } :
            { enabledAndroid: this._enabledByUser };
        AppController.Instance.User?.localSettings.updateHealthPermissions(diff);
    }

    dispose() { }
}