import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';
import { EventSubscription } from 'fbemitter';
import { observable, transaction } from 'mobx';
import ExpoConstants from 'expo-constants';

import { createLogger } from 'common/logger';
import {
    NotificationData,
    NotificationTypes,
    NotificationResult,
    NotificationSchedulingOptions,
    AndroidChannels,
    ScheduleResult,
} from 'common/models/Notifications';
import {
    getNotificationTimeMS,
    addDaysToDate,
    Schedule,
    NotificationTime,
    correctExactDate,
} from 'src/helpers/notifications';
import {
    getRandomUniqMessages,
    getMessagesForExactTime,
} from 'src/constants/notificationMessages';
import { GlobalTrigger, GlobalTriggers } from 'src/stateMachine/globalTriggers';
import Localization from 'src/services/localization';
import { Affirmation } from 'src/constants/QoL';

import { RemoteCallResult } from 'common/abstractions/controlllers/IBackendController';

const logger = createLogger('[Notifications]');

export interface IUserNameProvider {
    readonly firstName: string;
    readonly lastName: string;
}

const SCHEDULE_DAYS_COUNT = 7;
export class NotificationsService {
    @observable
    private _currentStatus: Notifications.NotificationPermissionsStatus;

    @observable.ref
    private _openedNotification: Notifications.NotificationRequest;

    private _notificationsSubscription: EventSubscription = null;

    private _tokenCached: string = null;

    private _domains: string[];
    private _affirmations: Affirmation[];

    public get domains() {
        return this._domains;
    }

    public set domains(domains: string[]) {
        this._domains = domains;
    }

    public get affirmations() {
        return this._affirmations;
    }

    public set affirmations(affirmations: Affirmation[]) {
        this._affirmations = affirmations;
    }

    constructor(private readonly user: IUserNameProvider) {
        if (!user) {
            throw new Error('IUserController is required');
        }
        this._notificationsSubscription = Notifications.addNotificationReceivedListener(
            this._onNotificationReceived,
        );

        // TEST
        // setTimeout(() => {

        //     const data: NotificationData = {
        //         type: NotificationTypes.CustomPrompt,
        //         originalText: 'bla-bla',
        //         promptId: '123',
        //         // phrasePrompt: 'You mentioned "life sucks". Can you tell me more about that?',
        //         // phrase: 'life sucks',
        //         // promptId: '2e3bdb9a-89f3-49bb-ac33-06308e368969',
        //         // originalText: 'Is there anything that feels frustrating right now?',
        //     };

        //     this._onNotificationReceived({
        //         isMultiple: false,
        //         remote: true,
        //         origin: 'selected',
        //         data,
        //     });
        // }, 7000);
    }

    public get openedNotification() {
        return this._openedNotification;
    }

    public get hasPermission() {
        switch (this._currentStatus.status) {
            case Permissions.PermissionStatus.GRANTED: {
                return true;
            }

            case Permissions.PermissionStatus.DENIED: {
                return false;
            }

            default: {
                return null;
            }
        }
    }

    async checkPermissions(): Promise<void> {
        const result = await Notifications.getPermissionsAsync();
        this._currentStatus = result;
        logger.log(`hasPermission = ${this.hasPermission}`);
    }

    async askPermission() {
        const result = await Notifications.requestPermissionsAsync();
        this._currentStatus = result;
    }

    async getToken(): Promise<string | null> {
        if (this.hasPermission && ExpoConstants.isDevice) {
            if (this._tokenCached) {
                return this._tokenCached;
            }
            //  Do we need token?
            // try {
            //     const token = await Notifications.getExpoPushTokenAsync();
            //     if (!token) {
            //         logger.error(
            //             'Notifications.getExpoPushTokenAsync() returned `null` while `this._currentStatus` =',
            //             this._currentStatus,
            //         );
            //     } else {
            //         this._tokenCached = token;
            //     }
            //     return token;
            // } catch (err) {
            //     logger.log('Failed to get notifications token');
            //     logger.error(err);
            // }
        }

        return null;
    }

    // private async scheduleMessage(
    //     msg: string,
    //     startDateMS: number,
    //     index: number,
    // ): Promise<NotificationResult> {
    //     const date = addDaysToDate(startDateMS, index);
    //     const schedulingOptions: NotificationSchedulingOptions = { time: date };
    //     const data = {
    //         type: NotificationTypes.Retention,
    //     };

    //     const notification: Notifications.Notification = {
    //         title: Localization.Current.MobileProject.projectName,
    //         data,
    //         body: msg,
    //         ios: { sound: true },
    //         android:
    //             Platform.OS === 'android'
    //                 ? { channelId: AndroidChannels.Default }
    //                 : null,
    //     };

    //     const scheduled = await Notifications.scheduleNotificationAsync(
    //         notification,
    //         schedulingOptions,
    //     );

    //     const notifId = Number.isNaN(scheduled)
    //         ? scheduled.toString()
    //         : (scheduled as string);

    //     logger.log(
    //         'scheduleNotifications with message:',
    //         notification.body,
    //         '| notification time is:',
    //         schedulingOptions.time,
    //     );
    //     const dateStr = new Date(schedulingOptions.time).toUTCString();
    //     return { body: notification.body, notifId, date: dateStr };
    // }

    private async scheduleAffirmationMessage(msg: Affirmation, affirmationTime: number): Promise<NotificationResult> {
        const schedulingOptions: NotificationSchedulingOptions = {
            time: new Date(affirmationTime).getTime(),
            repeat: 'day',
        };
        const notification: Notifications.NotificationRequestInput = {
            identifier: msg.id,
            content: {
                title: Localization.Current.MobileProject.projectName,
                body: msg.content,
                data: {
                    type: NotificationTypes.Affirmation,
                    id: msg.id
                },
                sound: true
            },
            trigger: { seconds: 6 },
        };

        const scheduled = await Notifications.scheduleNotificationAsync(
            notification,
        );

        const notifId = Number.isNaN(scheduled)
            ? scheduled.toString()
            : (scheduled as string);

        logger.log(
            'scheduleNotifications with message:',
            notification.content,
            // '| notification time is:',
            // schedulingOptions.time,
        );
        const dateStr = new Date(schedulingOptions.time).toUTCString();
        return {
            body: notification.content.body,
            notifId,
            affirmationId: notification.content.data['id'] as string,
            date: dateStr,
        };
    }

    // private async scheduleMessages(
    //     messages: string[],
    //     startDateMS: number,
    // ): Promise<NotificationResult[]> {
    //     let result: NotificationResult[] = await Promise.all(
    //         messages.map(
    //             async (
    //                 msg: string,
    //                 index: number,
    //             ): Promise<NotificationResult> => {
    //                 return await this.scheduleMessage(
    //                     msg as string,
    //                     startDateMS,
    //                     index,
    //                 );
    //             },
    //         ),
    //     );
    //     return result;
    // }

    private async scheduleAffirmationMessages(messages: Affirmation[], startDateMS: number): Promise<NotificationResult[]> {
        let result: NotificationResult[] = await Promise.all(
            messages.map(
                async (
                    msg: Affirmation,
                    index: number,
                ): Promise<NotificationResult> => {
                    return await this.scheduleAffirmationMessage(
                        msg as Affirmation,
                        startDateMS,
                    );
                },
            ),
        );
        return result;
    }

    // private async exportScheduled(
    //     clientID: string,
    //     notifs: NotificationResult[],
    // ): Promise<RemoteCallResult[]> {
    //     console.log(notifs);
    //     const backend = new FunctionBackendController();

    //     const allNotifs: Promise<RemoteCallResult>[] = notifs.map((not) =>
    //         backend.logNotification(clientID, not),
    //     );
    //     return Promise.all(allNotifs);
    // }

    private async scheduleNotifications(time: NotificationTime, startDateMS: number, clientID: string): Promise<NotificationResult[]> {
        const settings = { name: this.user.firstName };
        const result: NotificationResult[] = [];
        const messages =
            time === NotificationTime.ExactTime
                ? {
                    [NotificationTypes.Retention]: getMessagesForExactTime(
                        startDateMS,
                        SCHEDULE_DAYS_COUNT,
                        settings,
                    ),
                    [NotificationTypes.Affirmation]: this.affirmations
                        ? this.affirmations
                        : null,
                }
                : {
                    [NotificationTypes.Retention]: getRandomUniqMessages(
                        time,
                        SCHEDULE_DAYS_COUNT,
                        settings,
                    ),
                };

        // result.push(
        //     ...(await this.scheduleMessages(
        //         messages[NotificationTypes.Retention],
        //         startDateMS,
        //     )),
        // );
        // check for null, it is of type null when undefined or empty array is given
        if (messages[NotificationTypes.Affirmation]) {
            result.push(
                ...(await this.scheduleAffirmationMessages(
                    messages[NotificationTypes.Affirmation],
                    startDateMS,
                )),
            );
        }
        // try {
        //     await this.exportScheduled(clientID, result);
        // } catch (err) {
        //     logger.warn(err);
        // }

        return result;
    }

    public async rescheduleNotifications(schedule: Schedule, domains: string[], affirmations: Affirmation[], clientID: string): Promise<ScheduleResult> {
        await this.resetSchedule();

        if (Platform.OS === 'android') {
            await this.createAndroidChannel();
        }

        this.domains = domains;
        if (affirmations && affirmations.length > 0) {
            this.affirmations = affirmations;
        } else {
            this.affirmations = null;
        }

        const scheduleData: ScheduleResult = {};
        const keys = Object.keys(schedule);

        for (let i = 0; i < keys.length; i++) {
            const time = keys[i] as NotificationTime;
            const active =
                time === NotificationTime.ExactTime
                    ? schedule[time] && schedule[time].active
                    : schedule[time];

            if (!active) {
                continue;
            }

            const startDateMS =
                time === NotificationTime.ExactTime
                    ? correctExactDate(schedule[time] && schedule[time].value)
                    : getNotificationTimeMS(time);

            if (!startDateMS) {
                continue;
            }

            const res: NotificationResult[] = await this.scheduleNotifications(
                time,
                startDateMS,
                clientID,
            );
            scheduleData[time] = res;
        }

        return scheduleData;
    }

    public async resetSchedule(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();

        if (Platform.OS === 'android') {
            await this.deleteAndroidChannel();
        }
    }

    public resetOpenedNotification(): void {
        this._openedNotification = null;
    }

    async createAndroidChannel(): Promise<void> {
        const channel: Notifications.NotificationChannelInput = {
            name: Localization.Current.MobileProject.projectName,
            importance: 5,
        }
        await Notifications.setNotificationChannelAsync(AndroidChannels.Default, channel);
    }

    async deleteAndroidChannel(): Promise<void> {
        await Notifications.deleteNotificationChannelGroupAsync(AndroidChannels.Default);
    }

    private _onNotificationReceived = (event: Notifications.Notification) => {
        logger.log('received notification event:', event);

        if (NotificationData.guard(event.request)) {
            transaction(() => {
                this._openedNotification = null;
                this._openedNotification = { ...event.request };
            });

            GlobalTrigger(GlobalTriggers.NotificationReceived);
        }
    };

    dispose() {
        this._notificationsSubscription.remove();
        this._notificationsSubscription = null;
    }
}
