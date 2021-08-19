/* eslint-disable no-dupe-class-members */
import AsyncStorage from 'src/services/StorageAsync';
import { observable, toJS } from 'mobx';
import {
    NotificationsService,
    IUserNameProvider,
} from 'src/services/Notifications';
import {
    NotificationTime,
    Schedule,
    getDefaultSchedule,
} from 'src/helpers/notifications';
import { createLogger } from 'common/logger';
import { ILocalSettingsController } from './LocalSettings';
import { ScheduleResult } from 'common/models/Notifications';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import RepoFactory from 'common/controllers/RepoFactory';
import { Affirmation } from 'src/constants/QoL';
import { UserState } from 'common/models/userState';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // private _affirmationTime: number;
    private _domains: string[];
    private _keywordFilter: string[];
    private _userId: string;

    constructor(
        private readonly settings: ILocalSettingsController,
        name: IUserNameProvider,
    ) {
        this._service = new NotificationsService(name);
    }

    public setUser(userId: string) {
        this._userId = userId;
    }

    public get schedule(): Readonly<Schedule> {
        return this._schedule;
    }

    public get openedNotification() {
        return this._service.openedNotification;
    }

    public get enabled() {
        return this._enabledByUser && this._service.hasPermission;
    }

    public get permissionsGranted() {
        return this._service.hasPermission === true;
    }

    public get permissionsAsked() {
        return this._enabledByUser != null;
    }

    /* public get affirmationTime() {
        return this._affirmationTime;
    }

    public set affirmationTime(time: number) {
        this._affirmationTime = time;
    } */

    public get domains() {
        return this._domains;
    }

    public set domains(domains: string[]) {
        this._domains = domains;
    }

    public get keywordFilter() {
        return this._keywordFilter;
    }

    public set keywordFilter(filter: string[]) {
        this._keywordFilter = filter;
    }

    // Should be OK to call multiple times
    async initAsync() {
        await this._service.checkPermissions();

        // backward compatibility for 'enabled'
        if (this.settings.current.notifications?.enabled == null) {
            const allowedByUser = await AsyncStorage.getValue(
                AllowanceStorageKey,
            );
            this.settings.updateNotifications({
                enabled: allowedByUser ? allowedByUser === 'true' : null,
            });
        }

        // backward compatibility for 'schedule'
        if (this.settings.current.notifications?.locals == null) {
            const scheduleSerialized = await AsyncStorage.getValue(
                TimeStorageKey,
            );
            this._schedule =
                (scheduleSerialized &&
                    (JSON.parse(scheduleSerialized) as Schedule)) ||
                getDefaultSchedule();
        } else {
            this._schedule = this.settings.current.notifications.locals
                .schedule as Schedule;
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
    };

    public resetOpenedNotification = () => {
        this._service.resetOpenedNotification();
    };

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
    };

    public disableNotifications = async () => {
        this._enabledByUser = false;
        this._syncThrottle.tryRun(this.sync);
    };

    toggleTime(
        time:
            | NotificationTime.Morning
            | NotificationTime.Midday
            | NotificationTime.Evening,
    ): Promise<void>;
    toggleTime(time: NotificationTime.ExactTime, value: number): Promise<void>;
    toggleTime(
        time: NotificationTime.ExactTime,
        value: number,
        domains: string[],
        keywordFilter: string[],
    ): Promise<void>;

    public async toggleTime(
        time: NotificationTime,
        value?: number,
        domains?: string[],
        keywordFilter?: string[],
    ) {
        this.domains = domains;
        this.keywordFilter = keywordFilter;

        if (time === NotificationTime.ExactTime) {
            const timeobj = this.schedule[time] || {
                active: false,
                value: null,
                isAffirmation: !domains || !keywordFilter,
            };

            timeobj.active = !timeobj.active;
            timeobj.value = value;
            this._schedule[time] = timeobj;
        } else {
            this._schedule[time] = !this.schedule[time];
        }

        this._syncThrottle.tryRun(this.sync);
    }

    private sync = async (onlyToken = false) => {
        if (!this._userId) {
            throw new Error('no user id set');
        }
        const userState: UserState = await RepoFactory.Instance.userState.getByUserId(
            this._userId,
        );

        const affirmations: Affirmation[] = await RepoFactory.Instance.affirmations.getByDomain(
            this.domains,
            this.keywordFilter,
            userState.lastSeenAffirmations,
        );

        let scheduleResult: ScheduleResult | void;
        if (!onlyToken) {
            scheduleResult = this.enabled
                ? await this._service.rescheduleNotifications(
                      this.schedule,
                      this.domains,
                      affirmations,
                      this._userId,
                  )
                : await this._service.resetSchedule();
        }

        const token = this.enabled ? await this._service.getToken() : null;

        this.settings.updateNotifications({
            locals: scheduleResult
                ? {
                      current: scheduleResult,
                      schedule: toJS(this.schedule),
                  }
                : undefined,
            enabled: this._enabledByUser,
            token,
        });
    };

    public invalidateToken = async () => {
        if (!this.settings.current?.notifications?.token) {
            return;
        }

        this.settings.updateNotifications({ token: null });
    };

    dispose() {
        this._service.dispose();
    }
}
