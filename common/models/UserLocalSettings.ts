import Identify from './Identify';
import { ScheduleResult } from './Notifications';

export type UserLocalSettings = {
    deviceId: string,
    appVersion: string,
    deviceInfo?: DeviceInfo;

    notifications?: NotificationsSettings;
    healthPermissions?: HealthPermissionsSettings;
    qol?: QolSettings;
    lastDailyCheckIn?: string;
};

export type NotificationsSettings = {
    // currenty we use this only for locals
    enabled?: boolean,
    token?: string,
    locals?: LocalNotificationsSchedule,
};

export type HealthPermissionsSettings = {
    enabledAndroid?: boolean,
    seenPermissionPromptIOS?: boolean,
};

export type QolSettings = {
    seenQolOnboarding?: boolean,
    lastFullQol?: string,
    pendingFullQol: boolean,
    lastShortQol?: string,
    pendingShortQol: boolean,
};

export type LocalNotificationsSchedule = {
    current: ScheduleResult,
    schedule: {
        [type: string]: null | boolean | { active: boolean, value: number },
    },
};

export type DeviceInfo = {
    platform: string,
    platformVersion: string | number,
    isStandaloneDevice: boolean,
};

export type UserLocalSettingsIded = Identify<UserLocalSettings>;
