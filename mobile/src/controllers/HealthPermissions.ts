import AsyncStorage from 'src/services/StorageAsync';
import { observable } from 'mobx';
import { IUserNameProvider } from 'src/services/Notifications';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import { createLogger } from 'common/logger';
import {auth, init, isAvailable, stepCount, getHeight} from 'src/helpers/health'
import { Platform } from 'react-native';

const logger = createLogger('[HealthPermissionsController]');

const AllowanceStorageKey = 'healthAllowedByUser';

let isFirstUse = true;


export class HealthPermissionsController implements IDisposable {
    // private readonly _service: NotificationsService;

    // @observable
    // private _schedule: Schedule;

    @observable
    private _enabledByUser: boolean;


    @observable
    private _enabledByUserOG: boolean;



    // private _previousPermissionsState: boolean = null;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    constructor(private readonly settings: ILocalSettingsController, name: IUserNameProvider) {
        // this._service = new NotificationsService(name);
    }

    public get enabled() { return this._enabledByUser; }
    
    public get enabledOG() { return this._enabledByUserOG; }

    public get permissionsGranted() { return this._enabledByUser; }

    public get permissionsAsked() { return this._enabledByUser != null; }

    // Should be OK to call multiple times
    async initAsync() {
        this._enabledByUser = this.settings.current.health?.enabled;

        if (Platform.OS == 'ios' && this._enabledByUserOG){
            const steps = await stepCount(); 
            this._enabledByUserOG = steps;

            // this.settings.updateHealthPermissions({
            //     enabled: steps? true : false,
            //     });
        }
    }

    public askPermission = async () => {

        const authorized = Platform.OS == 'android'? await auth() : await init();

        if (Platform.OS == 'ios' && !this._enabledByUserOG){
            const steps = await stepCount(); 
            this._enabledByUserOG = steps;
        }

        logger.log("AUTHORIZED__", authorized);
        this._enabledByUser = authorized;

        await this.sync();
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