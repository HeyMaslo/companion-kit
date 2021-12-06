import { Platform } from 'react-native';
import ExpoConstants, { AppOwnership } from 'expo-constants';
import * as Device from 'expo-device';
import { observable, toJS, transaction } from 'mobx';
import { UserLocalSettings, NotificationsSettings, DeviceInfo, QolSettings } from 'common/models';
import RepoFactory from 'common/controllers/RepoFactory';
import { transferChangedFields } from 'common/utils/fields';
import { ThrottleAction } from 'common/utils/throttle';
import { IEvent, Event } from 'common/utils/event';
import { AppVersion } from './AppVersion';
import logger from 'common/logger';

const DeviceId = ExpoConstants.installationId;

const Info: DeviceInfo = {
    platform: Platform.OS,
    platformVersion: ExpoConstants.appOwnership === AppOwnership.Standalone
        ? Platform.Version
        : ('Expo Client ' + ExpoConstants.expoVersion),
    modelName: Device.modelName,
    isStandaloneDevice: ExpoConstants.appOwnership === AppOwnership.Standalone && Device.isDevice,
};

export interface ILocalSettingsController {
    readonly current: Readonly<UserLocalSettings>;
    readonly synced: IEvent;

    updateNotifications(diff: Partial<NotificationsSettings>, changedField: keyof NotificationsSettings): void;
    updateQolSettings(diff: Partial<QolSettings>, changedField: keyof QolSettings): void;
    updateLastDailyCheckIn(diff: string): void;

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
                }
            };
            updateDiff = this._current;

            this._sameDevice = settings.find(s => s.deviceInfo?.modelName === Info.modelName);
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

        logger.log('[LocalSettingsController] submitting changes...', diff);
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

        logger.log('[LocalSettingsController] submitting changes...', diff);
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
        if (diff.qol !== undefined) {
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
}
