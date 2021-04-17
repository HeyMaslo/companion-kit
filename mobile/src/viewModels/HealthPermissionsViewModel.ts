import { observable, computed, autorun, reaction } from 'mobx';
import AppController from 'src/controllers';
import { Alert,Platform } from 'react-native';
import { createLogger } from 'common/logger';
import * as Links from 'src/constants/links';
import Images from 'src/constants/images';

const logger = createLogger('[HealthPermissionsViewModel]');

// this can be updated when we want to add/remove permissions
const permissions = [{title:"Sex", icon: Images.difficultIcon, description: "Allow Companion kit to access sex info"}
,{title:"Date Of Birth", icon: Images.veryPositiveIcon, description: "Allow Companion kit to access DOB info"},
 {title:"Active Steps", icon:Images.busIcon, description: "Allow Companion kit to access Steps info"},
{title:"BMI", icon:Images.keyIcon, description: "Allow Companion kit to access BMI info"}];

export class HealthPermissionsViewModel {

    @observable
    private _toggleInProgress = false;

    @observable
    private _isEnabled: boolean = this.originalIsEnabled;

    private _unsubscribe: () => void = null;

    @observable
    private _isEnabledOG: boolean = this.originalIsEnabledOG;

    private get originalIsEnabled() { return !!AppController.Instance.User?.hasHealthDataPermissions.enabled; }
    private get originalIsEnabledOG() { return AppController.Instance.User?.hasHealthDataPermissions.enabledOG; }

    get isEnabled() { return this._isEnabled; }
    get isEnabledOG() { return this._isEnabledOG; }
    get isToggleInProgress() { return this._toggleInProgress; }

    get settingsSynced() { return AppController.Instance.User.localSettings.synced; }

    updateEnabledState = () => {
        this._isEnabledOG = this.originalIsEnabledOG;
    }

    getPermissions = () => {
        return permissions;
    }

    toggleEnabledState = async () => {
        if (this.isToggleInProgress) {
            return;
        }

        const prevValue = this._isEnabled;

        this._toggleInProgress = true;
        try {

            this._isEnabledOG = !this._isEnabledOG;
            this._isEnabled = !this._isEnabled;

            if (!AppController.Instance.User.hasHealthDataPermissions.enabled) {
                await AppController.Instance.User.hasHealthDataPermissions.enableHealthPermissions();
            }else {
                await AppController.Instance.User.hasHealthDataPermissions.disableHealthPermissions();
            }

        } finally {
            this.updateEnabledState();
            if ((!this._isEnabledOG) && Platform.OS == 'ios') {
                Alert.alert(
                    'Oops',
                    'Looks like health Permissions have been restricted. Please re-enable it anytime in Settings and try again.',
                    [
                        { text: 'Cancel',
                     },

                        {
                            text: 'Settings',
                            style: 'default',
                            onPress: async () => {
                                const url = 'app-settings:';
                                await Links.tryOpenLink(url);
                            },
                        },
                    ]);
            } else {
                if (Platform.OS == 'ios'){
                    Alert.alert(
                        'Oops',
                        'You need to disable permissions in your settings',
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
            }
            this._toggleInProgress = false;
        }
    }

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
