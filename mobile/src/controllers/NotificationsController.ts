import { observable } from 'mobx';
import { NotificationsService, IUserNameProvider } from 'src/services/NotificationsService';
import { ILocalSettingsController } from './LocalSettings';
import { ThrottleAction } from 'common/utils/throttle';
import { IDisposable } from 'common/utils/unsubscriber';
import RepoFactory from 'common/controllers/RepoFactory';
import { Affirmation } from 'src/constants/QoL';
import { UserState } from 'common/models/userState';
import { DomainName, SubdomainName } from 'src/constants/Domain';
import { HourAndMinute } from 'common/utils/dateHelpers';
import AppController from '.';
import { shuffle } from 'common/utils/mathx';

export class NotificationsController implements IDisposable {

    private readonly _service: NotificationsService;

    @observable
    private _notificationsEnabledByUser: boolean;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    private _userId: string;

    private get allowBDMention() {
        return AppController.Instance.User.localSettings.current.notifications.allowBDMention || false;
    }

    constructor(private readonly settings: ILocalSettingsController, name: IUserNameProvider) {
        this._service = new NotificationsService(name);
    }

    public setUser(userId: string) {
        this._userId = userId;
    }

    public domainAndSubdomainNames: (DomainName | SubdomainName)[]; // only affirmations containing these domains will be scheduled

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

    public askPermission = async (): Promise<boolean> => {
        await this._service.askNotificationsPermissions();
        await this.sync();
        return this.permissionsGranted;
    };

    // Remove the opened notification from userState.scheduledAffirmations and reset the openedNotification
    public async completeOpenedNotification(currentUserState: UserState = null): Promise<UserState> {
        return currentUserState ?
            this.onFulfilled(currentUserState) :
            RepoFactory.Instance.userState.getByUserId(this._userId).then(this.onFulfilled);
    };

    // Used only by above function
    private onFulfilled = (userState: UserState) => {
        const filtered = userState.scheduledAffirmations.filter((sa) => sa.notifId != this.openedNotification.identifier);
        if (filtered !== userState.scheduledAffirmations) {
            userState.scheduledAffirmations = filtered;
            RepoFactory.Instance.userState.setByUserId(this._userId, userState);
            this._service.resetOpenedNotification();
        }
        return userState;
    }

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
            userState = await this.completeOpenedNotification(userState); // make sure nothing is leftover from old notifcations

            let possibleAffirmations: Affirmation[] = await RepoFactory.Instance.affirmations.getByDomains(
                this.domainAndSubdomainNames,
                this.allowBDMention,
                userState.lastSeenAffirmations);
            possibleAffirmations = shuffle(possibleAffirmations);

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(this.scheduleTime.hour, this.scheduleTime.minute, 0, 0);

            const scheduled = await this._service.scheduleAffirmationMessages(possibleAffirmations.slice(0, 27), tomorrow.getTime(), this.allowBDMention);
            scheduled.forEach((result) => {
                userState.lastSeenAffirmations[result.affirmation.id] = result.scheduledDate;
                userState.scheduledAffirmations.push(result);
            });

            RepoFactory.Instance.userState.setByUserId(this._userId, userState);
        }
    }

    // MK-TODO: - testing only remove before merge
    public async scheduleTESTINGAffirmationNotification() {
        if (!this._userId) throw new Error('no user id set');
        if (this.notificationsEnabled) {
            let userState: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);

            let possibleAffirmations: Affirmation[] = await RepoFactory.Instance.affirmations.getByDomains(this.domainAndSubdomainNames, true, userState.lastSeenAffirmations);
            possibleAffirmations = shuffle(possibleAffirmations);

            const now = new Date();

            const scheduled = await this._service.scheduleAffirmationMessages(possibleAffirmations.slice(0, 1), now.getTime() + 10000, this.allowBDMention);
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
        this.settings.updateNotifications({ enabled: this._notificationsEnabledByUser }, 'enabled');
    };

    dispose() {
        this._service.dispose();
    }
}