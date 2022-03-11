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
import { Platform } from 'react-native';

export class NotificationsController implements IDisposable {

    private readonly _service: NotificationsService;

    @observable
    private _notificationsEnabledByUser: boolean;

    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(1000);

    private _userId: string;

    private get allowBDMention() {
        return AppController.Instance.User.localSettings.current.notifications.allowBDMention;
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
        return Platform.OS == 'android' || this._service.hasPermission === true;
    }

    // Should be OK to call multiple times
    async initAsync() {
        console.log('NotifController initAsync() called')
        if (Platform.OS == 'android') {
            this._notificationsEnabledByUser = true;
            return;
        }
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
        if (userState.scheduledAffirmations) {
            const filtered = userState.scheduledAffirmations.filter((sa) => sa.notifId != this.openedNotification.identifier);
            if (filtered !== userState.scheduledAffirmations) {
                userState.scheduledAffirmations = filtered;
                RepoFactory.Instance.userState.setByUserId(this._userId, userState);
                this._service.resetOpenedNotification();
            }
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

    // Schedule 27 daily affirmation notifications starting tomorrow at this.scheduleTime
    public async scheduleTwentySevenAffirmationNotifications() {
        if (!this._userId) throw new Error('no user id set');
        if (this.notificationsEnabled) {
            let userState: UserState = await RepoFactory.Instance.userState.getByUserId(this._userId);
            userState = await this.completeOpenedNotification(userState); // make sure nothing is leftover from old notifcations

            let allPossibleAffirmations: Affirmation[] = await RepoFactory.Instance.affirmations.getByDomains(
                this.domainAndSubdomainNames,
                this.allowBDMention,
                userState.lastSeenAffirmations);
            allPossibleAffirmations = shuffle(allPossibleAffirmations);

            const firstDomain = this.domainAndSubdomainNames[0]; // there will always be at least domain
            const secondDomain = this.domainAndSubdomainNames.length > 1 ? this.domainAndSubdomainNames[1] : null;
            const thirdDomain = this.domainAndSubdomainNames.length > 2 ? this.domainAndSubdomainNames[2] : null;
            const actualDomains = [firstDomain, secondDomain, thirdDomain].filter((d) => d);

            // Interleave affirmations based on domain, i.e. if they chose Mood and Sleep they should recieve a Mood affirmation then a Sleep the next day then a Mood and so on
            let affirmationsToSchedule = [];
            switch (actualDomains.length) {
                case 1:
                    affirmationsToSchedule = allPossibleAffirmations.slice(0, 27);
                    break;
                case 2:
                    const firstDomainAffirmations = allPossibleAffirmations.filter((aff) => aff.domainNames[0] == firstDomain);
                    const secondDomainAffirmations = allPossibleAffirmations.filter((aff) => aff.domainNames[0] == secondDomain);
                    for (let i = 0; i < 13; i++) { // (27 / 2 = 13.5) so we use 13 here and concat 1 more affirmation after the loop to get a total of 27
                        affirmationsToSchedule.concat(firstDomainAffirmations[i]);
                        affirmationsToSchedule.concat(secondDomainAffirmations[i]);
                    }
                    affirmationsToSchedule.concat(firstDomainAffirmations[13]);
                    break;
                case 3:
                    const thirdDomainAffirmations = allPossibleAffirmations.filter((aff) => aff.domainNames[0] == thirdDomain);
                    for (let i = 0; i < 9; i++) {
                        affirmationsToSchedule.concat(firstDomainAffirmations[i]);
                        affirmationsToSchedule.concat(secondDomainAffirmations[i]);
                        affirmationsToSchedule.concat(thirdDomainAffirmations[i]);
                    }
                    break;
            }

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(this.scheduleTime.hour, this.scheduleTime.minute, 0, 0);

            const scheduled = await this._service.scheduleAffirmationMessages(affirmationsToSchedule.slice(0, 26), tomorrow.getTime(), this.allowBDMention);
            scheduled.forEach((result) => {
                userState.lastSeenAffirmations[result.affirmation.id] = result.scheduledDate;
                userState.scheduledAffirmations.push(result);
            });
            console.log('SCHEDULED: ', scheduled)
            RepoFactory.Instance.userState.setByUserId(this._userId, userState);
        } else {
            console.log('scheduleTwentySevenAffirmationNotifications(): NOTIFICATIONS not enabled')
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