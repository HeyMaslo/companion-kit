import { HourAndMinute } from '../utils/dateHelpers';
import { DomainName } from '../../mobile/src/constants/Domain';
import Identify from './Identify';

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
    enabled: boolean,
    scheduledTime: HourAndMinute,
    allowBDMention: boolean,
    domainsForNotifications: DomainName[],
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

export type DeviceInfo = {
    platform: string,
    platformVersion: string | number,
    isStandaloneDevice: boolean,
};

export type UserLocalSettingsIded = Identify<UserLocalSettings>;
