import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';
import { EventSubscription } from 'fbemitter';
import { observable, transaction } from 'mobx';
import {
    Notification,
    LocalNotification,
} from 'expo/build/Notifications/Notifications.types';
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
    isAffirmation,
} from 'src/constants/notificationMessages';
import { GlobalTrigger, GlobalTriggers } from 'src/stateMachine/globalTriggers';
import Localization from 'src/services/localization';
import { getAffirmationForDomains } from 'src/constants/affirmationMessages';
import { Affirmation } from 'src/constants/QoL';

import { FunctionBackendController } from '../../../server/functions/src/services/backend';
import { RemoteCallResult } from 'common/abstractions/controlllers/IBackendController';

const logger = createLogger('[Notifications]');

export interface IUserNameProvider {
    readonly firstName: string;
    readonly lastName: string;
}

const SCHEDULE_DAYS_COUNT = 7;
export class NotificationsService {
    @observable
    private _currentStatus: Permissions.PermissionStatus;

    @observable.ref
    private _openedNotification: NotificationData;

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
        this._notificationsSubscription = Notifications.addListener(
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
        switch (this._currentStatus) {
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
        const result = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        this._currentStatus = result.status;
        logger.log(`hasPermission = ${this.hasPermission}`);
    }

    async askPermission(): Promise<void> {
        if (this.hasPermission === null) {
            const result = await Permissions.askAsync(
                Permissions.NOTIFICATIONS,
            );
            this._currentStatus = result.status;
            logger.log('got new permission:', this.hasPermission);
        }
    }

    async getToken(): Promise<string | null> {
        if (this.hasPermission && ExpoConstants.isDevice) {
            if (this._tokenCached) {
                return this._tokenCached;
            }

            try {
                const token = await Notifications.getExpoPushTokenAsync();
                if (!token) {
                    logger.error(
                        'Notifications.getExpoPushTokenAsync() returned `null` while `this._currentStatus` =',
                        this._currentStatus,
                    );
                } else {
                    this._tokenCached = token;
                }
                return token;
            } catch (err) {
                logger.log('Failed to get notifications token');
                logger.error(err);
            }
        }

        return null;
    }

    private async scheduleMessage(
        msg: string,
        startDateMS: number,
        index: number,
    ): Promise<NotificationResult> {
        const date = addDaysToDate(startDateMS, index);
        const schedulingOptions: NotificationSchedulingOptions = { time: date };
        const data = {
            type: NotificationTypes.Retention,
        };

        const notification: LocalNotification = {
            title: Localization.Current.MobileProject.projectName,
            data,
            body: msg,
            ios: { sound: true },
            android:
                Platform.OS === 'android'
                    ? { channelId: AndroidChannels.Default }
                    : null,
        };

        const scheduled = await Notifications.scheduleLocalNotificationAsync(
            notification,
            schedulingOptions,
        );

        const notifId = Number.isNaN(scheduled)
            ? scheduled.toString()
            : (scheduled as string);

        logger.log(
            'scheduleNotifications with message:',
            notification.body,
            '| notification time is:',
            schedulingOptions.time,
        );
        const dateStr = new Date(schedulingOptions.time).toUTCString();
        return { body: notification.body, id: notifId, date: dateStr };
    }

    private async scheduleAffirmationMessage(
        msg: Affirmation,
        affirmationTime: number,
    ): Promise<NotificationResult> {
        const schedulingOptions: NotificationSchedulingOptions = {
            time: new Date(affirmationTime).getTime(),
            repeat: 'day',
        };
        const notification: LocalNotification = {
            title: Localization.Current.MobileProject.projectName,
            data: {
                type: NotificationTypes.Affirmation,
                id: msg.id,
            },
            body: msg.text,
            ios: { sound: true },
            android:
                Platform.OS === 'android'
                    ? { channelId: AndroidChannels.Default }
                    : null,
        };

        const scheduled = await Notifications.scheduleLocalNotificationAsync(
            notification,
            schedulingOptions,
        );

        const notifId = Number.isNaN(scheduled)
            ? scheduled.toString()
            : (scheduled as string);

        logger.log(
            'scheduleNotifications with message:',
            notification.body,
            '| notification time is:',
            schedulingOptions.time,
        );
        const dateStr = new Date(schedulingOptions.time).toUTCString();
        return {
            body: notification.body,
            id: notifId,
            affirmationId: notification.data.id,
            date: dateStr,
        };
    }

    private async scheduleMessages(
        messages: string[] | Affirmation[],
        startDateMS: number,
        isAffirmation: boolean,
    ): Promise<NotificationResult[]> {
        let result: NotificationResult[] = await Promise.all(
            messages.map(
                async (
                    msg: string | Affirmation,
                    index: number,
                ): Promise<NotificationResult> => {
                    return isAffirmation
                        ? await this.scheduleAffirmationMessage(
                              msg as Affirmation,
                              startDateMS,
                          )
                        : await this.scheduleMessage(
                              msg as string,
                              startDateMS,
                              index,
                          );
                },
            ),
        );
        return result;
    }

    private async exportScheduled(clientID: string, notifs: NotificationResult[]): Promise<RemoteCallResult> {
        console.log(notifs);
        const backend = new FunctionBackendController();
        return backend.logNotifications(clientID, notifs);
    }

    private async scheduleNotifications(
        time: NotificationTime,
        startDateMS: number,
        isAffirmation: boolean,
        clientID: string,
    ): Promise<NotificationResult[]> {
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
                      [NotificationTypes.TestAffirmation]: getAffirmationForDomains(
                          this.domains,
                          1,
                          settings,
                      ),
                  }
                : {
                      [NotificationTypes.Retention]: getRandomUniqMessages(
                          time,
                          SCHEDULE_DAYS_COUNT,
                          settings,
                      ),
                  };

        result.push(
            ...(await this.scheduleMessages(
                messages[NotificationTypes.Retention],
                startDateMS,
                isAffirmation,
            )),
        );
        // check for null, it is of type null when undefined or empty array is given
        if (messages[NotificationTypes.Affirmation]) {
            result.push(
                ...(await this.scheduleMessages(
                    messages[NotificationTypes.Affirmation],
                    startDateMS,
                    isAffirmation,
                )),
            );
        }
        result.push(
            ...(await this.scheduleMessages(
                messages[NotificationTypes.TestAffirmation],
                startDateMS,
                isAffirmation,
            )),
        );
        try {
            await this.exportScheduled(clientID, result);
        } catch (err) {
            logger.warn(err);
        }

        return result;
    }

    public async rescheduleNotifications(
        schedule: Schedule,
        domains: string[],
        affirmations: Affirmation[],
        clientID: string,
    ): Promise<ScheduleResult> {
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
                time === NotificationTime.ExactTime &&
                    schedule[time].isAffirmation,
                clientID
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
    };

    public resetOpenedNotification(): void {
        this._openedNotification = null;
    };

    async createAndroidChannel(): Promise<void> {
        await Notifications.createChannelAndroidAsync(AndroidChannels.Default, {
            name: Localization.Current.MobileProject.projectName,
            sound: true,
            vibrate: true,
        });
    }

    async deleteAndroidChannel(): Promise<void> {
        await Notifications.deleteChannelAndroidAsync(AndroidChannels.Default);
    }

    private _onNotificationReceived = (n: Notification) => {
        logger.log('received notification:', n);

        if (NotificationData.guard(n.data)) {
            transaction(() => {
                this._openedNotification = null;
                this._openedNotification = { ...n.data };
            });

            GlobalTrigger(GlobalTriggers.NotificationReceived);
        }
    };

    dispose() {
        this._notificationsSubscription.remove();
        this._notificationsSubscription = null;
    }
}
