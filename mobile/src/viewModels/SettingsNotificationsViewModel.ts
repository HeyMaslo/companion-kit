import { observable, computed, reaction } from 'mobx';
import AppController from 'src/controllers';
import { Alert, Linking, Platform } from 'react-native';
import * as Links from 'src/constants/links';
import { HourAndMinute } from 'common/utils/dateHelpers';
import { DomainName, SubdomainName } from 'src/constants/Domain';

export class SettingsNotificationsViewModel {

    @observable
    private _toggleInProgress = false;

    @observable
    private _isEnabled: boolean = this.originalIsEnabled;

    private _unsubscribe: () => void = null;

    private get originalIsEnabled() { return !!AppController.Instance.User?.notifications.notificationsEnabled; }

    private _posssibleDomains: (DomainName | SubdomainName)[] = [];

    get scheduledTime(): HourAndMinute { return AppController.Instance.User.localSettings.current.notifications.scheduledTime };
    @observable
    public domainsForNotifications: (DomainName | SubdomainName)[] = AppController.Instance.User.localSettings.current.notifications.domainsForNotifications;
    @observable
    public allowBDMention: boolean = AppController.Instance.User.localSettings.current.notifications.allowBDMention;

    get posssibleDomains() { return this._posssibleDomains; }

    get isEnabled() { return this._isEnabled; }
    get isToggleInProgress() { return this._toggleInProgress; }

    get settingsSynced() { return AppController.Instance.User.localSettings.synced; }

    // returns a string similar to 'Daily at 1:30 PM', varies slightly by locale
    @computed
    get scheduleTimeString(): string {
        if (this.scheduledTime == null) {
            return 'On';
        }
        const date = new Date();
        date.setHours(this.scheduledTime.hour, this.scheduledTime.minute)
        const localeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        if (Platform.OS == 'ios') {
            return 'Daily at ' + localeString;
        }
        const splits = localeString.split(':'); // splits are done becuase the android date locale might include seconds
        const androidTimeString = splits.length > 1 ? splits[0] + ':' + splits[1] : localeString;
        return 'Daily at ' + androidTimeString;
    }

    public setScheduledTime(time: HourAndMinute) {
        AppController.Instance.User.localSettings.updateNotifications({ scheduledTime: time }, 'scheduledTime');
    }

    public setAllDomains(allDomains: (DomainName | SubdomainName)[]) {
        if (allDomains) {
            const filtered = allDomains.filter((dom) => dom != DomainName.PHYSICAL)
            this._posssibleDomains = filtered;
            this.domainsForNotifications = filtered;
            AppController.Instance.User.notifications.domainAndSubdomainNames = filtered;
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

    public completeNotificationsOnboarding() {
        AppController.Instance.User.localSettings.updateNotifications({ allowBDMention: this.allowBDMention }, 'allowBDMention');
        AppController.Instance.User.localSettings.updateNotifications({ domainsForNotifications: this.domainsForNotifications }, 'domainsForNotifications');
        AppController.Instance.User.localSettings.updateOnboardingSettings({ needsNotificationsOnboarding: false }, 'needsNotificationsOnboarding');
    }
}
