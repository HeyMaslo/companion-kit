import { Platform } from 'react-native';
import ExpoConstants, { AppOwnership } from 'expo-constants';
import * as Device from 'expo-device';
import { observable, toJS, transaction } from 'mobx';
import { UserLocalSettings, NotificationsSettings, DeviceInfo, LocalNotificationsSchedule, QolSettings } from 'common/models';
import RepoFactory from 'common/controllers/RepoFactory';
import { transferChangedFields } from 'common/utils/fields';
import { ThrottleAction } from 'common/utils/throttle';
import { IEvent, Event } from 'common/utils/event';
import { AppVersion } from './AppVersion';
import logger from 'common/logger';
import { QolSurveyType } from 'src/constants/QoL';

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

    updateNotifications(diff: Partial<NotificationsSettings>): void;
    updateQolOnboarding(diff: Partial<QolSettings>): void;
    updateLastQol(diff: Partial<QolSettings>, type: QolSurveyType): void;
    updatePendingQol(diff: Partial<QolSettings>, type: QolSurveyType): void;
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
                { notifications: { ...this._sameDevice.notifications, token: null } },
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

    updateNotifications(diff: Partial<NotificationsSettings>) {
        const notifications = this.current.notifications || { };
        transaction(() => {
            let changed = transferChangedFields(diff, notifications, 'enabled', 'token');

            if (diff.locals && getLocalsHash(diff.locals) !== getLocalsHash(notifications.locals)) {
                notifications.locals = diff.locals;
                changed = true;
            }

            if (changed) {
                // logger.log('UPDATE');
                this.update({ notifications });
            }
        });
    }

    updateQolOnboarding(diff: Partial<QolSettings>) {
        const qol = this.current.qol || { };
        transaction(() => {
            let changed = transferChangedFields(diff, qol, 'seenQolOnboarding', 'lastFullQol');

            if (changed) {
                this.update({ qol });
            }
        });
    }

    updateLastQol(diff: Partial<QolSettings>, type: QolSurveyType) {
        const qol = this.current.qol || { };
        let toChange: keyof QolSettings;
        switch (type) {
            case QolSurveyType.Full:
                toChange = 'lastFullQol';
                break;
            case QolSurveyType.Short:
                toChange = 'lastShortQol';
                break;
            default:
                console.log(`updateLastQol ERROR: ${type} not implemented in switch`)
                return;
        }
        transaction(() => {
            let changed = transferChangedFields(diff, qol, toChange);

            if (changed) {
                this.update({ qol });
            }
        });
    }

    updatePendingQol(diff: Partial<QolSettings>, type: QolSurveyType) {
        const qol = this.current.qol || { };
        let toChange: keyof QolSettings;
        switch (type) {
            case QolSurveyType.Full:
                toChange = 'pendingFullQol';
                break;
            case QolSurveyType.Short:
                toChange = 'pendingShortQol';
                break;
            default:
                console.log(`updatePendingQol ERROR: ${type} not implemented in switch`)
                return;
        }
        transaction(() => {
            let changed = transferChangedFields(diff, qol, toChange);

            if (changed) {
                this.update({ qol });
            }
        });
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

function getLocalsHash(locals: LocalNotificationsSchedule): string {
    if (!locals) {
        return null;
    }

    const prts: string[] = [];

    if (locals.current) {
        prts.push('[C]:');
        Object.keys(locals.current).forEach(k => {
            const v = locals.current[k];
            const vv = v?.length
                ? v.map(n => `${n.date}`).join('|')
                : '';
            prts.push(`${k}+${vv};`);
        });
    }

    if (locals.schedule) {
        prts.push('[S]:');
        Object.keys(locals.schedule).forEach(k => {
            const v = locals.schedule[k];
            const vv = !v
                ? ''
                : (v === true
                    ? 'true' : `${v.active}_${v.value}`
                );
            prts.push(`${k}_${vv};`);
        });
    }

    const res = prts.join('');
    return res;
}