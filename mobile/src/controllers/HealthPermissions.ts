import AsyncStorage from 'src/services/StorageAsync';
import { observable } from 'mobx';
import { IUserNameProvider } from 'src/services/Notifications';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import { createLogger } from 'common/logger';
import {auth, init} from 'src/helpers/health'
import { Platform } from 'react-native';

const logger = createLogger('[HealthPermissionsController]');


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
       if (this.settings.current.health?.enabled === null){
           // very first time using the app
           this.settings.updateHealthPermissions({
            enabled: false,
            });
            this._enabledByUser = this.settings.current.notifications?.enabled;
            logger.log("IN INIT FIRST TIME", this.permissionsAsked);
            logger.log("FALSE && NULL", (null === false));
            return;
       }

       if (this.settings.current.health?.enabled === false){
        logger.log("enabled in init", this.settings.current.health?.enabled);
           //user denied permissions at some point
           const enabledbyUser = Platform.OS == 'android'? await auth() : init();
           logger.log("ENABLED BY USER",enabledbyUser);
           if (enabledbyUser){
            this.settings.updateHealthPermissions({
                enabled: true,
            });
            // this._enabledByUser = this.settings.current.notifications?.enabled;
           }
        }

       this._enabledByUser = this.settings.current.notifications?.enabled;
       await this.sync();
    }

    public askPermission = async () => {
        const authorized = Platform.OS == 'android'? await auth() : await init();
        logger.log("AUTH_ASK_HELPER", authorized)
        if (Platform.OS == 'ios' && authorized == 1){
            logger.log("NEW METHOD", authorized)
            
            this._enabledByUser = true;
        } else {
            logger.log("NEW METHOD1", authorized)
            logger.log("NEW METHOD", Platform.OS)
            this._enabledByUser = authorized;
        } 
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