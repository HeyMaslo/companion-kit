import AsyncStorage from 'src/services/StorageAsync';
import { observable, toJS } from 'mobx';
import { NotificationsService, IUserNameProvider } from 'src/services/Notifications';
import { NotificationTime, Schedule, getDefaultSchedule } from 'src/helpers/notifications';
import { createLogger } from 'common/logger';
import { ILocalSettingsController } from './LocalSettings';
import { ScheduleResult } from 'common/models/Notifications';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';

const logger = createLogger('[NotificationsController]');

const AllowanceStorageKey = 'notificationsAllowedByUser';
const TimeStorageKey = 'notificationsTime';

export class NotificationsController implements IDisposable {
    private readonly _service: NotificationsService;

    @observable
    private _schedule: Schedule;

    @observable
    private _enabledByUser: boolean;

    private _previousPermissionsState: boolean = null;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    constructor(private readonly settings: ILocalSettingsController, name: IUserNameProvider) {
        this._service = new NotificationsService(name);
    }

    public get schedule(): Readonly<Schedule> { return this._schedule; }

    public get openedNotification() { return this._service.openedNotification; }

    public get enabled() { return this._enabledByUser && this._service.hasPermission; }

    public get permissionsGranted() { return this._service.hasPermission === true; }

    public get permissionsAsked() { return this._enabledByUser != null; }

    // Should be OK to call multiple times
    async initAsync() {
        await this._service.checkPermissions();

        // backward compatibility for 'enabled'
        if (this.settings.current.notifications?.enabled == null) {
            const allowedByUser = await AsyncStorage.getValue(AllowanceStorageKey);
            this.settings.updateNotifications({
                enabled: allowedByUser ? allowedByUser === 'true' : null,
            });
        }

        // backward compatibility for 'schedule'
        if (this.settings.current.notifications?.locals == null) {
            const scheduleSerialized = await AsyncStorage.getValue(TimeStorageKey);
            this._schedule = (scheduleSerialized && JSON.parse(scheduleSerialized) as Schedule)
                || getDefaultSchedule();
        } else {
            this._schedule = this.settings.current.notifications.locals.schedule as Schedule;
        }

        this._enabledByUser = this.settings.current.notifications?.enabled;

        // allow re-schedule in case when notifications state before were unknown or disabled
        const updateSchedule = !this._previousPermissionsState && this.enabled;
        await this.sync(!updateSchedule);

        this._previousPermissionsState = this.enabled;
    }

    public askPermission = async () => {
        await this._service.askPermission();
        await this.sync(true);
        return this.permissionsGranted;
    }

    public resetOpenedNotification = () => {
        this._service.resetOpenedNotification();
    }

    public enableNotifications = async () => {
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

    public disableNotifications = async () => {
        this._enabledByUser = false;
        this._syncThrottle.tryRun(this.sync);
    }

    toggleTime(time: NotificationTime.Morning | NotificationTime.Midday | NotificationTime.Evening): Promise<void>;
    toggleTime(time: NotificationTime.ExactTime, value: number): Promise<void>;

    public async toggleTime(time: NotificationTime, value?: number) {
        if (time === NotificationTime.ExactTime) {
            const timeobj = this.schedule[time] || { active: false, value: null };

            timeobj.active = !timeobj.active;
            timeobj.value = value;
            this._schedule[time] = timeobj;
        } else {
            this._schedule[time] = !this.schedule[time];
        }

        this._syncThrottle.tryRun(this.sync);
    }

    private sync = async (onlyToken = false) => {
        let scheduleResult: ScheduleResult | void;
        if (!onlyToken) {
            scheduleResult = this.enabled
                ? await this._service.rescheduleNotifications(this.schedule)
                : await this._service.resetSchedule();
        }

        const token = this.enabled
            ? await this._service.getToken()
            : null;

        this.settings.updateNotifications({
            locals: scheduleResult ? {
                current: scheduleResult,
                schedule: toJS(this.schedule),
            } : undefined,
            enabled: this._enabledByUser,
            token,
        });
    }

    public invalidateToken = async () => {
        if (!this.settings.current?.notifications?.token) {
            return;
        }

        this.settings.updateNotifications({ token: null });
    }

    dispose() {
        this._service.dispose();
    }
}
