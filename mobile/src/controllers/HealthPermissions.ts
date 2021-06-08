import { observable } from 'mobx';
import { IUserNameProvider } from 'src/services/Notifications';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import {auth, init, disconnectAndroid, getDOB, getStepCount, getMindfulSession} from 'src/helpers/health'
import { Platform } from 'react-native';
import logger, { createLogger } from 'common/logger';


export class HealthPermissionsController implements IDisposable {

    @observable
    private _enabledByUser: boolean;

    @observable
    private _enabledByUserOG: boolean;

    @observable
    private _enabledByUserActivity: boolean;

    @observable
    private _enabledByUserMindfulness: boolean;

    // @observable
    // private _enabledByUserMobility: boolean;

    // @observable
    // private _enabledByUserNutrition: boolean;

    // @observable
    // private _enabledByUserRespiractory: boolean;

    // @observable
    // private _enabledByUserSleep: boolean;


    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    constructor(private readonly settings: ILocalSettingsController, name: IUserNameProvider) {
    }

    public get enabled() { return this._enabledByUser; }
    
    public get enabledOG() { return this._enabledByUserOG; }

    public get enabledActivity() {return this._enabledByUserActivity}

    public get enabledMindfulness() {return this._enabledByUserMindfulness}

    // public get enabledMobility() {return this._enabledByUserMobility}

    // public get enabledNutrition() {return this._enabledByUserNutrition}

    // public get enabledRespiractory() {return this._enabledByUserRespiractory}

    // public get enabledSleep() {return this._enabledByUserSleep}

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
        logger.log("PERMS", authorized);

        if (Platform.OS == 'ios'){
            const dob = await getDOB(); 
            const activity = await getStepCount();
            const mindfulness = await getMindfulSession();
            // const mobility = await getCarbohydratesSamples();
            // const nutrition = await getWater();
            // const respiractory = await getRespiratoryRateSamples();
            // const sleep = await getSleepSamples();
            this._enabledByUserOG = dob;
            this._enabledByUserActivity = activity;
            this._enabledByUserMindfulness = mindfulness;
            // this._enabledByUserMobility = mobility;
            // this._enabledByUserNutrition = nutrition;
            // this._enabledByUserRespiractory = respiractory;
            // this._enabledByUserSleep = sleep;
        }
        if (Platform.OS == 'android'){ 
            this._enabledByUserOG = authorized;
        }
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
            this._enabledByUser = false;
            this._syncThrottle.tryRun(this.sync);
            return;
        }

        return false; 
    }

    private sync = async () => {
        this.settings.updateHealthPermissions({
            enabled: this._enabledByUser,
        });
    }

    dispose() {
    }
}