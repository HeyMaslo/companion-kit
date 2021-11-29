import Identify from './Identify';

export type UserLocalSettings = {
    deviceId: string,
    appVersion: string,
    deviceInfo?: DeviceInfo;

    notifications?: NotificationsSettings;
    qol?: QolSettings;
    lastDailyCheckIn?: string;
};

export type NotificationsSettings = {
    enabled?: boolean,
};

export type QolSettings = {
    seenQolOnboarding?: boolean,
    lastFullQol?: string,
    pendingFullQol: boolean,
    lastShortQol?: string,
    pendingShortQol: boolean,
};

export type DeviceInfo = {
    platform: string,
    platformVersion: string | number,
    modelName: string,
    isStandaloneDevice: boolean,
};

export type UserLocalSettingsIded = Identify<UserLocalSettings>;
