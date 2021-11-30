import { observable, computed, reaction } from 'mobx';
import AppController from 'src/controllers';
import { Alert, Linking } from 'react-native';
import * as Links from 'src/constants/links';
import { HourAndMinute } from 'common/utils/dateHelpers';
import { DomainName } from 'src/constants/Domain';

export class SettingsNotificationsViewModel {

    @observable
    private _toggleInProgress = false;

    @observable
    private _isEnabled: boolean = this.originalIsEnabled;

    private _unsubscribe: () => void = null;

    private get originalIsEnabled() { return !!AppController.Instance.User?.notifications.notificationsEnabled; }

    private _posssibleDomains: DomainName[] = [];

    @observable
    public scheduledTime: HourAndMinute = null;
    @observable
    public domainsForNotifications: DomainName[] = [];
    @observable
    public allowBDMention: Boolean = false; // MK-TODO: what should default be (false or true)

    get posssibleDomains() { return this._posssibleDomains; }

    get isEnabled() { return this._isEnabled; }
    get isToggleInProgress() { return this._toggleInProgress; }

    get settingsSynced() { return AppController.Instance.User.localSettings.synced; }

    @computed
    get scheduleTimeString(): string {
        if (this.scheduledTime == null) {
            return 'On';
        }
        const date = new Date();
        date.setHours(this.scheduledTime.hour, this.scheduledTime.minute)
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    public setDomains(domains: DomainName[]) {
        if (domains) {
            this._posssibleDomains = domains;
            this.domainsForNotifications = domains;
        }
    }

    updateEnabledState = () => {
        this._isEnabled = this.originalIsEnabled;
    }

    toggleEnabledState = async () => {
        if (this.isToggleInProgress) {
            return;
        }

        const prevValue = this._isEnabled;

        this._toggleInProgress = true;
        try {

            this._isEnabled = !this._isEnabled;

            if (!AppController.Instance.User.notifications.notificationsEnabled) {
                await AppController.Instance.User.notifications.enableNotifications();
            } else {
                await AppController.Instance.User.notifications.disableNotifications();
            }

        } finally {
            this.updateEnabledState();

            if (!prevValue && prevValue === this._isEnabled) {
                Alert.alert(
                    'Oops',
                    'Looks like notifications have been restricted. Please re-enable it anytime in Settings and try again.',
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

    init() {
        this.updateEnabledState();
        this._unsubscribe = reaction(() => this.originalIsEnabled, enabled => {
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
