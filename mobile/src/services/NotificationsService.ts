import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { EventSubscription } from 'fbemitter';
import { observable, transaction } from 'mobx';
import { createLogger } from 'common/logger';
import { NotificationTypes, AndroidChannels } from 'common/models/Notifications';
import { ScheduledAffirmationNotification } from 'common/models/userState';
import Localization from 'src/services/localization';
import { Affirmation } from 'src/constants/QoL';
import { PermissionStatus } from 'expo-modules-core';
import { DateTriggerInput } from 'expo-notifications';
import { DomainName } from 'src/constants/Domain';
import { GlobalTrigger, GlobalTriggers } from 'src/stateMachine/globalTriggers';

const logger = createLogger('[NotificationsController]');

export interface IUserNameProvider {
    readonly firstName: string;
    readonly lastName: string;
}

// This class is used to interface with the OS through expo-notifications
// Used ONLY by NoticationController
export class NotificationsService {

    @observable
    private _currentStatus: Notifications.NotificationPermissionsStatus;

    @observable.ref
    private _openedNotification: Notifications.NotificationRequest;

    private _notificationsSubscription: EventSubscription = null;
    private _notificationsTapSubscription: EventSubscription = null;

    constructor(private readonly user: IUserNameProvider) {
        if (!user) {
            throw new Error('IUserController is required');
        }
        this._notificationsSubscription = Notifications.addNotificationReceivedListener(
            // Called when notifcation is recieved and user is in app
            this._onNotificationReceived,
        );
        this._notificationsTapSubscription = Notifications.addNotificationResponseReceivedListener(
            // Called when user taps on notifcation and it opens the app
            this._onNotificationTap,
        );
    }

    public domainNames: DomainName[];
    public affirmations: Affirmation[];

    public get openedNotification() {
        return this._openedNotification;
    }

    public get hasPermission(): boolean | null {
        if (!this._currentStatus) return null;
        switch (this._currentStatus.status) {
            case PermissionStatus.GRANTED: {
                return true;
            }

            case PermissionStatus.DENIED: {
                return false;
            }

            default: {
                return null;
            }
        }
    }

    public async checkNotificationsPermissions() {
        const result = await Notifications.getPermissionsAsync();
        this._currentStatus = result;
    }

    public async askNotificationsPermissions() {
        const result = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true, // badge can't be updated by local notifications (only by push notifications) but it can be set/changed when app is running
                allowSound: true,
            }
        });
        this._currentStatus = result;
    }

    private async scheduleAffirmationMessage(affirmation: Affirmation, affirmationTime: number, allowBDMention: boolean): Promise<ScheduledAffirmationNotification> {
        const affirmationDate = new Date(affirmationTime);
        console.log('afiirm date', affirmationDate.toLocaleString())
        const schedulingOptions: DateTriggerInput = {
            channelId: AndroidChannels.Default,
            date: affirmationDate,
        };
        const isSensitiveMessage: boolean = affirmation.mentionsBD && !allowBDMention;
        const notification: Notifications.NotificationRequestInput = {
            identifier: affirmation.id,
            content: {
                title: Localization.Current.MobileProject.projectName,
                body: isSensitiveMessage ? 'Anon String because this affirmation has content that mentions **' : affirmation.content,
                data: {
                    type: NotificationTypes.Affirmation,
                    id: affirmation.id,
                    privateBody: affirmation.content,
                },
                sound: true
            },
            trigger: schedulingOptions,
        };

        const scheduledNotificationId = await Notifications.scheduleNotificationAsync(notification);

        console.log('scheduleAffirmationMessage content: ', notification.content);
        return {
            affirmation: affirmation,
            notifId: scheduledNotificationId,
            scheduledDate: affirmationDate.getTime(),
        };
    }

    // Schedule each affirmation in messages 24 hours after the other, beggining at startDateMS
    public async scheduleAffirmationMessages(messages: Affirmation[], startDateMS: number, allowBDMention: boolean): Promise<ScheduledAffirmationNotification[]> {
        const oneDayMS = 86400000; // 24 hours in milliseconds
        let result: ScheduledAffirmationNotification[] = await Promise.all(
            messages.map(
                async (
                    msg: Affirmation,
                    index: number,
                ): Promise<ScheduledAffirmationNotification> => {
                    return await this.scheduleAffirmationMessage(
                        msg as Affirmation,
                        startDateMS + index * oneDayMS,
                        allowBDMention,
                    );
                },
            ),
        );
        return result;
    }

    public async cancelAllUpcomingNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();

        // if (Platform.OS === 'android') {
        //     await this.deleteAndroidChannel();
        // }
    }

    public resetOpenedNotification(): void {
        this._openedNotification = null;
    }

    public async createAndroidChannel(): Promise<void> {
        const channel: Notifications.NotificationChannelInput = {
            name: Localization.Current.MobileProject.projectName,
            importance: 5,
        }
        await Notifications.setNotificationChannelAsync(AndroidChannels.Default, channel);
    }

    public async deleteAndroidChannel(): Promise<void> {
        await Notifications.deleteNotificationChannelGroupAsync(AndroidChannels.Default);
    }

    private _onNotificationReceived = async (event: Notifications.Notification) => {
        this.handleNotification(event.request);
    };

    private _onNotificationTap = async (event: Notifications.NotificationResponse) => {
        this.handleNotification(event.notification.request);
    };

    private handleNotification(request: Notifications.NotificationRequest) {
        this._openedNotification = request;
        GlobalTrigger(GlobalTriggers.NotificationReceived);
    }

    dispose() {
        this._notificationsSubscription.remove();
        this._notificationsSubscription = null;
        this._notificationsTapSubscription.remove();
        this._notificationsTapSubscription = null;
    }
}
