import { observable } from 'mobx';
import { NotificationsService, IUserNameProvider } from 'src/services/NotificationsService';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import RepoFactory from 'common/controllers/RepoFactory';
import { Affirmation } from 'src/constants/QoL';
import { UserState } from 'common/models/userState';
import { DomainName } from 'src/constants/Domain';
import { HourAndMinute } from 'common/utils/dateHelpers';

export class NotificationsController implements IDisposable {

    private readonly _service: NotificationsService;

    @observable
    private _notificationsEnabledByUser: boolean;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    private _userId: string;

    constructor(private readonly settings: ILocalSettingsController, name: IUserNameProvider) {
        this._service = new NotificationsService(name);
    }

    public setUser(userId: string) {
        this._userId = userId;
    }

    public domainNames: DomainName[]; // only affirmations containing these domains will be scheduled

    public scheduleTime: HourAndMinute; // the time of day the user wants to recieve a notification in miliseconds

    public get openedNotification() {
        return this._service.openedNotification;
    }

    public get notificationsEnabled() {
        return this._notificationsEnabledByUser && this.permissionsGranted;
    }

    public get permissionsAsked() {
        return this._service.hasPermission != null;
    }

    public get permissionsGranted() {
        return this._service.hasPermission === true;
    }

    // Should be OK to call multiple times
    async initAsync() {
        console.log('NotifController initAsync() called')
        this._notificationsEnabledByUser = this.settings.current.notifications.enabled;
        if (!this._notificationsEnabledByUser) return;
        await this._service.checkNotificationsPermissions();
        this._notificationsEnabledByUser = this.permissionsGranted;
        this._syncThrottle.tryRun(this.sync);
    }

    // public checkPermission = async () => {
    //     await this._service.checkNotificationsPermissions();
    //     this.settings.updateNotifications({
    //         enabled: this._service.hasPermission == true,
    //     });
    // };

    public askPermission = async (): Promise<boolean> => {
        await this._service.askNotificationsPermissions();
        await this.sync();
        return this.permissionsGranted;
    };

    public resetOpenedNotification = () => {
        this._service.resetOpenedNotification();
    };

    public enableNotifications = async () => {
        // try to request permission (don't know they were denied or just never asked)
        if (!this.permissionsGranted) {
            const enabled = await this.askPermission();
            if (!enabled) {
                return false;
            }
        }
        this._notificationsEnabledByUser = true;
        this._syncThrottle.tryRun(this.sync);
        return true;
    };

    public disableNotifications = async () => {
        this._notificationsEnabledByUser = false;
        await this._service.cancelAllUpcomingNotifications();
        this._syncThrottle.tryRun(this.sync);
    };

    // Schedule 28 daily affirmation notifications starting tomorrow at this.scheduleTime
    public async scheduleTwentyEightAffirmationNotifications() {
        if (!this._userId) throw new Error('no user id set');
        if (this.notificationsEnabled) {
            let userState: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
            const possibleAffirmations: Affirmation[] = await RepoFactory.Instance.affirmations.getByDomains(this.domainNames, false, userState.lastSeenAffirmations);

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(this.scheduleTime.hour, this.scheduleTime.minute, 0, 0);

            const scheduled = await this._service.scheduleAffirmationMessages(possibleAffirmations.slice(0, 27), tomorrow.getTime());
            scheduled.forEach((result) => {
                userState.lastSeenAffirmations[result.affirmation.id] = result.scheduledDate;
                userState.scheduledAffirmations.push(result);
            });
            console.log('userState.lastSeenAffirmations', userState.lastSeenAffirmations);
            console.log('userState.scheduledAffirmations', userState.scheduledAffirmations);
            RepoFactory.Instance.userState.setByUserId(this._userId, userState);
        }
    }

    // Cancels all upcoming notifcations
    public async cancelScheduledNotifications() {
        if (!this._userId) throw new Error('no user id set');
        let userState: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);

        this._service.cancelAllUpcomingNotifications();
        userState.scheduledAffirmations.forEach(san => {
            userState.lastSeenAffirmations[san.affirmation.id] = null;
        })
        userState.scheduledAffirmations = [];
        return await RepoFactory.Instance.userState.setByUserId(this._userId, userState);
    }

    private sync = async () => {
        this.settings.updateNotifications({
            enabled: this._notificationsEnabledByUser,
        });
    };

    dispose() {
        this._service.dispose();
    }
}