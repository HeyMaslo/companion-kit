import { HourAndMinute } from '../utils/dateHelpers';
import { DomainName, DomainSlug, Subdomain, SubdomainName } from '../../mobile/src/constants/Domain';
import Identify from './Identify';

export type UserLocalSettings = {
    deviceId: string,
    appVersion: string,
    deviceInfo?: DeviceInfo;

    onboarding: OnboardingSettings;
    notifications: NotificationsSettings;
    healthPermissions: HealthPermissionsSettings;
    qol: QolSettings;
    lastDailyCheckIn: string;
    strategiesConfirmed: boolean;
};

export type OnboardingSettings = {
    completed: boolean, // true when user has entirely finished the onboarding process
    needsQolOnboarding: boolean,
    needsDomainOnboarding: boolean,
    needsStrategyOnboarding: boolean,
    needsNotificationsOnboarding: boolean,
};

export type NotificationsSettings = {
    enabled: boolean,
    scheduledTime: HourAndMinute,
    allowBDMention: boolean,
    domainsForNotifications: DomainSlug[],
};

export type HealthPermissionsSettings = {
    enabledAndroid?: boolean,
    seenPermissionPromptIOS?: boolean,
};

export type QolSettings = {
    lastFullQol: string,
    pendingFullQol: boolean,
    lastShortQol: string,
    pendingShortQol: boolean,
    isFirstEverQol: boolean,
};

export type DeviceInfo = {
    platform: string,
    platformVersion: string | number,
    isStandaloneDevice: boolean,
};

export type UserLocalSettingsIded = Identify<UserLocalSettings>;
