import AsyncStorage from 'src/services/StorageAsync';
import { observable } from 'mobx';
import { IUserNameProvider } from 'src/services/Notifications';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import { createLogger } from 'common/logger';
import {auth, init, stepCount, disconnectAndroid} from 'src/helpers/health'
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

        if (this.permissionsGranted){
            this.askPermission();
        }
    }

    public askPermission = async () => {

        const authorized = Platform.OS == 'android'? await auth() : await init();

        if (Platform.OS == 'ios'){
            const steps = await stepCount(); 
            this._enabledByUserOG = steps;
            logger.log("ask permission por",  this._enabledByUserOG);
        }
        if (Platform.OS == 'android'){ 
            this._enabledByUserOG = authorized;
        }

        logger.log("AUTHORIZED__", authorized);
        this._enabledByUser = authorized;

        await this.sync();
        return this.permissionsGranted;
    }

    // enableHealthPermissions
    public enableHealthPermissions = async () => {

        const enabled = await this.askPermission();
        if (!enabled) {
            return false;
        }
        return true;
    }

    public disableHealthPermissions = async () => {
        if (Platform.OS == 'android') {
            disconnectAndroid();
        }
        this._enabledByUser = false;
        this._enabledByUserOG = this._enabledByUser;
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