import { observable, computed, autorun, reaction } from 'mobx';
import AppController from 'src/controllers';
import { NotificationTime, timeToString } from 'src/helpers/notifications';
import { Alert, Linking, Platform } from 'react-native';
import { createLogger } from 'common/logger';
import * as Links from 'src/constants/links';

const logger = createLogger('[HealthPermissionsViewModel]');

export class HealthPermissionsViewModel {

    @observable
    private _toggleInProgress = false;

    @observable
    private _isEnabled: boolean = this.originalIsEnabled;

    private _unsubscribe: () => void = null;

    @observable
    private _isEnabledOG: boolean = this.originalIsEnabledOG;

   // private enabledSettings: boolean = this.originalIsEnabled1;

    private get originalIsEnabled() { return !!AppController.Instance.User?.hasHealthDataPermissions.enabled; }
    private get originalIsEnabledOG() { return !!AppController.Instance.User?.hasHealthDataPermissions.enabledOG; }

    get isEnabled() { return this._isEnabled; }
    get isEnabledOG() { return this._isEnabledOG; }
    get isToggleInProgress() { return this._toggleInProgress; }

    // get schedule() { return AppController.Instance.User.notifications.schedule; }

    get settingsSynced() { return AppController.Instance.User.localSettings.synced; }

    // @computed
    // get scheduleTimeString() {
    //     const ntfTime = AppController.Instance.User.notifications.schedule;

    //     if (!ntfTime) {
    //         return 'Not specified';
    //     }

    //     const keys = Object.keys(ntfTime) as NotificationTime[];
    //     const strings = keys.map(time => {
    //         const val = time === NotificationTime.ExactTime
    //             ? ntfTime[time] && ntfTime[time].active
    //             : ntfTime[time];

    //         const res = val ? timeToString(time) : '';

    //         return res;
    //     });

    //     const filtered = strings.filter(v => !!v);
    //     const result = filtered.join(', ');

    //     return result && result.length !== 0 ? result : 'Not specified';
    // }

    updateEnabledState = () => {
        this._isEnabled = this.originalIsEnabled;
        this._isEnabledOG = this.originalIsEnabledOG;
    }

    toggleEnabledState = async () => {
        if (this.isToggleInProgress) {
            return;
        }

        const prevValue = this._isEnabled;

        this._toggleInProgress = true;
        try {

            // this._isEnabled = !this._isEnabled;

            if (!AppController.Instance.User.hasHealthDataPermissions.enabled) {
                await AppController.Instance.User.hasHealthDataPermissions.enableHealthPermissions();
            } else {
                if (Platform.OS != 'ios'){
                await AppController.Instance.User.hasHealthDataPermissions.disableHealthPermissions();}
            }

        } finally {
            this.updateEnabledState();

            // need to learn who you is!!
            logger.log("PREV_VAL-val", prevValue, this.originalIsEnabled);

            if ((this.isEnabled != this._isEnabledOG) && Platform.OS == 'ios') {
                logger.log("PREV_VAL_LATEST", prevValue);
                Alert.alert(
                    'Oops',
                    'Looks like health Permissions have been restricted. Please re-enable it anytime in Settings/Health and try again.',
                    [
                        { text: 'Cancel' },

                        {
                            text: 'Settings',
                            onPress: async () => {
                                const url = 'app-settings:';
                                await Links.tryOpenLink(url);
                            },
                            style: 'default',
                        },
                    ]);
            }

            this._toggleInProgress = false;
        }
    }

    // toggleTime = (time: NotificationTime, value?: number) => {
    //     return time === NotificationTime.ExactTime
    //         ? AppController.Instance.User.notifications.toggleTime(time, value)
    //         : AppController.Instance.User.notifications.toggleTime(time);
    // }

    init() {
        this.updateEnabledState();
        logger.log('init this.originalIsEnabled =', this.originalIsEnabled, 'this.isEnabled =', this.isEnabled);
        this._unsubscribe = reaction(() => this.originalIsEnabled, enabled => {
            logger.log('originalIsEnabled CHANGED:', enabled, ', this.isEnabled =', this.isEnabled);
            if (this._toggleInProgress) {
                return;
            }
            this.updateEnabledState();
        });
    }

    dispose() {
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}
