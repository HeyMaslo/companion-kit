import AsyncStorage from 'src/services/StorageAsync';
import { observable } from 'mobx';
import { IUserNameProvider } from 'src/services/Notifications';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import { createLogger } from 'common/logger';
import {auth, init} from 'src/helpers/health'
import { Platform } from 'react-native';
import AppleHealthKit from 'rn-apple-healthkit';

const PERMS = AppleHealthKit.Constants.Permissions;

const options = {
  permissions: {
    read: [PERMS.BiologicalSex],
    write: [],
  },
};

const logger = createLogger('[HealthPermissionsController]');

const AllowanceStorageKey = 'healthAllowedByUser';


export class HealthPermissionsController implements IDisposable {
    // private readonly _service: NotificationsService;

    // @observable
    // private _schedule: Schedule;

    @observable
    private _enabledByUser: boolean;

    // private _previousPermissionsState: boolean = null;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    constructor(private readonly settings: ILocalSettingsController, name: IUserNameProvider) {
        // this._service = new NotificationsService(name);
    }

    // public get schedule(): Readonly<Schedule> { return this._schedule; }

    // public get openedNotification() { return this._service.openedNotification; }

    public get enabled() { return this._enabledByUser; }

    public get permissionsGranted() { return this._enabledByUser; }

    public get permissionsAsked() { return this._enabledByUser != null; }

    // Should be OK to call multiple times
    async initAsync() {
        // logger.log("INIT HEALTH - latest-l", this.settings.current.health?.enabled);
       if (this.settings.current.health?.enabled == null){
           // very first time using the app
           const allowedByUser = await AsyncStorage.getValue(AllowanceStorageKey);
           logger.log("ALLOWED_BY_USER_INOT", allowedByUser === 'true');
           this.settings.updateHealthPermissions({
            enabled: allowedByUser? allowedByUser === 'true' : null,
            });
            // this._enabledByUser = this.settings.current.notifications?.enabled;
            logger.log("IN INIT FIRST TIME", this.permissionsAsked);
            // logger.log("FALSE && NULL", (null === false));
            // return;
            this._enabledByUser = allowedByUser === 'true';
       }

    //    if (this.settings.current.health?.enabled === false){
    //     logger.log("enabled in init", this.settings.current.health?.enabled);
    //        //user denied permissions at some point
    //        const enabledbyUser = Platform.OS == 'android'? await auth() : init();
    //        logger.log("ENABLED BY USER",enabledbyUser);
    //        if (enabledbyUser){
    //         this.settings.updateHealthPermissions({
    //             enabled: true,
    //         });
    //         // this._enabledByUser = this.settings.current.notifications?.enabled;
    //        }
    //     }

    //    this._enabledByUser = this.settings.current.notifications?.enabled;
       logger.log("INIT HEALTH - latest", this._enabledByUser);
       await this.sync();
    }

    public askPermission = async () => {
        const authorized = Platform.OS == 'android'? await auth() : null;
        if (Platform.OS == 'android'){
            logger.log("NEW METHOD", authorized)
            this._enabledByUser = true;
            // await AsyncStorage.setValue(AllowanceStorageKey, 'true');
        } else {
            this._enabledByUser = false;
        }

        if (Platform.OS == 'ios') {
            const yep = await init();
            this._enabledByUser = true;
        }
        await AsyncStorage.setValue(AllowanceStorageKey, 'true');
        await this.sync();
        logger.log("PERMISSIONGRANTED", this.permissionsGranted);
        return this.permissionsGranted;
    }

    // enableHealthPermissions
    public enableHealthPermissions = async () => {
        logger.log("ENABLE_PERMISSIONS", this.permissionsGranted);
        if (!this.permissionsGranted) {
            // try to request permission (don't know they were denied or just never asked)
            const enabled = await this.askPermission();
            if (!enabled) {
                return false;
            }
        }

        this._enabledByUser = true;
        this._syncThrottle.tryRun(this.sync);
        return true;
    }

    public disableHealthPermissions = async () => {
        this._enabledByUser = false;
        this._syncThrottle.tryRun(this.sync);
    }

    private sync = async () => {
        this.settings.updateHealthPermissions({
            enabled: this._enabledByUser,
        });
    }

    dispose() {
        // this._service.dispose();
    }
}
// 