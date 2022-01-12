import { Platform } from 'react-native';
import ExpoConstants, { AppOwnership } from 'expo-constants';
import { observable, toJS, transaction } from 'mobx';
import { UserLocalSettings, NotificationsSettings, DeviceInfo, QolSettings, HealthPermissionsSettings } from 'common/models';
import RepoFactory from 'common/controllers/RepoFactory';
import { transferChangedFields } from 'common/utils/fields';
import { ThrottleAction } from 'common/utils/throttle';
import { IEvent, Event } from 'common/utils/event';
import { AppVersion } from './AppVersion';

const DeviceId = ExpoConstants.installationId;

const Info: DeviceInfo = {
    platform: Platform.OS,
    platformVersion: ExpoConstants.appOwnership === AppOwnership.Standalone
        ? Platform.Version
        : ('Expo Client ' + ExpoConstants.expoVersion),
    isStandaloneDevice: ExpoConstants.appOwnership === AppOwnership.Standalone,
};

export interface ILocalSettingsController {
    readonly current: Readonly<UserLocalSettings>;
    readonly synced: IEvent;

    updateNotifications(diff: Partial<NotificationsSettings>, changedField: keyof NotificationsSettings): void;
    updateQolSettings(diff: Partial<QolSettings>, changedField: keyof QolSettings): void;
    updateLastDailyCheckIn(diff: string): void;
    updateStrategiesConfirmed(diff: boolean): void;
    updateHealthPermissions(diff: HealthPermissionsSettings): void;

    flushChanges(): Promise<void>;
}

export class LocalSettingsController implements ILocalSettingsController {

    @observable
    private _sameDevice: UserLocalSettings = null;

    @observable
    private _current: UserLocalSettings = null;

    private _uid: string;
    private readonly _syncThrottle = new ThrottleAction<Promise<void>>(2000);

    private readonly _synced = new Event();

    public get current(): Readonly<UserLocalSettings> { return this._current; }
    public get synced(): IEvent { return this._synced; }

    async load(uid: string) {
        if (this._uid === uid) {
            return;
        }

        const settings = await RepoFactory.Instance.users.getAllLocalSettings(uid);

        this._uid = uid;
        this._current = settings.find(s => s.deviceId === DeviceId);

        let updateDiff: Partial<UserLocalSettings> = null;
        if (!this._current) {
            // INITIAL STATE for UserLocalSettings after account is created
            this._current = {
                deviceId: DeviceId,
                deviceInfo: Info,
                appVersion: AppVersion.FullVersion,
                qol: {
                    seenQolOnboarding: false,
                    pendingFullQol: true,
                    pendingShortQol: false,
                    lastShortQol: Date(),
                },
                lastDailyCheckIn: Date(),
                notifications: {
                    enabled: false,
                    scheduledTime: { hour: 0, minute: 0 },
                    allowBDMention: false,
                    domainsForNotifications: [],
                },
                strategiesConfirmed: null,
            };
            updateDiff = this._current;
        } else if (this._current.appVersion !== AppVersion.FullVersion
            || this._current.deviceInfo?.platformVersion !== Info.platformVersion) {

            updateDiff = {
                appVersion: AppVersion.FullVersion,
                deviceInfo: Info,
            };
        }

        if (updateDiff) {
            await RepoFactory.Instance.users.updateLocalSettings(this._uid, DeviceId, updateDiff);
        }
    }

    private submitChanges = async () => {
        const diff: Partial<UserLocalSettings> = {
            notifications: toJS(this._current.notifications),
            lastDailyCheckIn: toJS(this._current.lastDailyCheckIn)
        };

        if (this._sameDevice && this._sameDevice.notifications) {
            await RepoFactory.Instance.users.updateLocalSettings(
                this._uid,
                this._sameDevice.deviceId,
                { notifications: { ...this._sameDevice.notifications } },
            );
        }

        await RepoFactory.Instance.users.updateLocalSettings(
            this._uid,
            DeviceId,
            diff,
        );
        await this._synced.triggerAsync();
    }

    private submitChangesHealth = async () => {
        const diff: Partial<UserLocalSettings> = {
            healthPermissions: toJS(this._current.healthPermissions),
        };

        await RepoFactory.Instance.users.updateLocalSettings(
            this._uid,
            DeviceId,
            diff,
        );
        await this._synced.triggerAsync();
    }

    private submitQolChanges = async () => {
        const diff: Partial<UserLocalSettings> = {
            qol: toJS(this._current.qol),

        };

        await RepoFactory.Instance.users.updateLocalSettings(
            this._uid,
            DeviceId,
            diff,
        );
        await this._synced.triggerAsync();
    }

    private update(diff: Partial<UserLocalSettings>) {
        if (!this._current) {
            throw new Error('LocalSettingsController.update: not initialized!');
        }

        Object.assign(this._current, diff);
        if (this.current.healthPermissions !== undefined) {
            this._syncThrottle.tryRun(this.submitChangesHealth);
        } else if (diff.qol !== undefined) {
            this._syncThrottle.tryRun(this.submitQolChanges);
        } else {
            this._syncThrottle.tryRun(this.submitChanges);
        }
    }

    public flushChanges() {
        return this._syncThrottle.forceRun();
    }

    updateNotifications(diff: Partial<NotificationsSettings>, changedField: keyof NotificationsSettings) {
        const notifications = this.current.notifications;
        if (!notifications) return;
        transaction(() => {
            let changed = transferChangedFields(diff, notifications, changedField);

            if (changed) {
                this.update({ notifications });
            }
        });
    }

    updateHealthPermissions(diff: Partial<HealthPermissionsSettings>) {
        let health = this.current.healthPermissions || {};
        health.seenPermissionPromptIOS = true;
        transaction(() => {
            let changed = transferChangedFields(diff, health, 'enabledAndroid', 'seenPermissionPromptIOS');
            if (changed) {
                this.update({ healthPermissions: health });
            }
        });
    }

    updateQolSettings(diff: Partial<QolSettings>, changedField: keyof QolSettings) {
        const qol = this.current.qol;
        if (qol) {

            transaction(() => {
                let changed = transferChangedFields(diff, qol, changedField);

                if (changed) {
                    this.update({ qol });
                }
            });
        }
    }

    updateLastDailyCheckIn(diff: string) {
        let lastDailyCheckIn = this.current.lastDailyCheckIn;
        transaction(() => {
            let changed = diff !== lastDailyCheckIn;

            if (changed) {
                lastDailyCheckIn = diff;
                this.update({ lastDailyCheckIn });
            }
        });
    }

    updateStrategiesConfirmed(diff: boolean) {
        let strategiesConfirmed = this.current.strategiesConfirmed;
        transaction(() => {
            let changed = diff !== strategiesConfirmed;

            if (changed) {
                strategiesConfirmed = diff;
                this.update({ strategiesConfirmed });
            }
        });
    }
}
