// import AsyncStorage from 'src/services/StorageAsync';
import { observable } from 'mobx';
import { IUserNameProvider } from 'src/services/Notifications';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import { createLogger } from 'common/logger';
// import logger from 'common/logger';
//

const logger = createLogger('[HealthPermissionsController]');

// const AllowanceStorageKey = 'notificationsAllowedByUser';
// const TimeStorageKey = 'notificationsTime';
const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
      // Scopes.FITNESS_ACTIVITY_WRITE,
      // Scopes.FITNESS_BODY_READ,
      // Scopes.FITNESS_BODY_WRITE,
      // Scopes.FITNESS_AUTH,
    ]
  }

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

        // await this._service.checkPermissions();
        await GoogleFit.checkIsAuthorized();
        logger.log("in INIT iS ENABLED : ", this._enabledByUser);

        // backward compatibility for 'enabled'
        if (this.settings.current.notifications?.enabled == null) {
            const allowedByUser = GoogleFit.isAuthorized;
            logger.log("in INIT: ", GoogleFit.isAuthorized);
            // call googleFit is is Authorized.
            this.settings.updateHealthPermissions({
                enabled: allowedByUser ? allowedByUser === true : null,
            });
        }

        this._enabledByUser = this.settings.current.health?.enabled;
    }

    public askPermission = async () => {
        await GoogleFit.checkIsAuthorized();
        if (!GoogleFit.isAuthorized){
             GoogleFit.authorize(options).then(authResult => {
                if (authResult.success) {
                    this._enabledByUser = true;
                    logger.log("ENABLED IS TRUE")
                // logger.log("AUTH_SUCCESS_IMPROVED", authResult);
             } else {
                 this._enabledByUser = false;
                 logger.log("ENABLED IS FALSE")
                // logger.log("AUTH_DENIED", authResult);
                // setData(false);
            }
            })
            .catch((err) => { this._enabledByUser = null;})
        } else {
            logger.log("SET ENABLED TO TRUE IS GFIT")
            this._enabledByUser = true;
        }
        await this.sync();
        return this.permissionsGranted;
    }

    // public resetOpenedNotification = () => {
    //     this._service.resetOpenedNotification();
    // }

    // enableHealthPermissions
    public enableHealthPermissions = async () => {
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

    // toggleTime(time: NotificationTime.Morning | NotificationTime.Midday | NotificationTime.Evening): Promise<void>;
    // toggleTime(time: NotificationTime.ExactTime, value: number): Promise<void>;

    // public async toggleTime(time: NotificationTime, value?: number) {
    //     if (time === NotificationTime.ExactTime) {
    //         const timeobj = this.schedule[time] || { active: false, value: null };

    //         timeobj.active = !timeobj.active;
    //         timeobj.value = value;
    //         this._schedule[time] = timeobj;
    //     } else {
    //         this._schedule[time] = !this.schedule[time];
    //     }

    //     this._syncThrottle.tryRun(this.sync);
    // }

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