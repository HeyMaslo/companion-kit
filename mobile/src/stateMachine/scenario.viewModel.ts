import AppController from 'src/controllers';
import AppViewModel from 'src/viewModels';
import * as Features from 'common/constants/features';
import { Platform } from 'react-native';

export class ScenarioViewModel {

    public readonly showLocation = Features.Mobile.CheckIns.AskCheckinLocation;

    public readonly nullify = <T>(condition: boolean, smth: T) => (condition ? smth : null);

    public readonly invert = (cb: () => boolean) => (() => !cb());
    public readonly combineAnd = (cb1: () => boolean, cb2: () => boolean) => (() => cb1() && cb2());
    public readonly combineOr = (condition: boolean, cb: () => boolean) => (() => condition || cb());

    public readonly userLoggedIn = () => !!AppController.Instance.User.user?.client;

    // user configuration block
    public readonly shouldCreatePassword = () => (
        this.userLoggedIn()
        && AppController.Instance.Auth.setPasswordMode === true
    )

    public readonly userWithPassword = () => this.userLoggedIn() && !this.shouldCreatePassword();

    // account configuration block
    public readonly missingAccount = () => AppController.Instance.User.accountMissing;
    public readonly userWithAccount = () => this.userWithPassword() && !this.missingAccount();

    public readonly confirmAccount = () => this.userWithAccount() && !AppController.Instance.User.user?.client?.onboarded;
    public readonly userConfirmed = () => this.userWithAccount() && !!AppController.Instance.User.user?.client?.onboarded;

    public readonly userPreparing = () => AppController.Instance.User.initializing;

    public readonly homeReady = () => !this.userPreparing() && this.userConfirmed();

    public readonly hasActiveOnboarding = () => process.appFeatures.MOBILE_ONBOARDING_ENABLED === true && this.userWithAccount() && AppController.Instance.User.onboardingDayIndex != null && !AppController.Instance.User.hasSeenOnboarding;
    public readonly showOnboardingExit = () => process.appFeatures.MOBILE_ONBOARDING_ENABLED === true && AppViewModel.Instance.CreateCheckIn.beforeSubmitState?.onboardingIndex != null;
    public readonly showNewReward = () => process.appFeatures.CLIENT_REWARDS_ENABLED === true && AppViewModel.Instance.CreateCheckIn.beforeSubmitState?.rewardLevel < AppController.Instance.User.rewards?.level;

    // NOTIFICATIONS
    public readonly notificationReceived = () => this.homeReady(); // this may need more checks
    public readonly askNotifyPermissions = () => Platform.OS != 'android' && AppController.Instance.User && !AppController.Instance.User?.notifications.permissionsGranted && !AppController.Instance.User?.notifications.permissionsAsked;

    public readonly showConsent = () => process.appFeatures.MOBILE_SHOW_CONSENT === true && this.userConfirmed() && !AppController.Instance.User.user?.client?.consentAccepted;
    public readonly showAssessment = () => process.appFeatures.ASSESSMENTS_ENABLED === true && this.userWithAccount() && !!AppController.Instance.User.assessments.nextFormTypeAvailable;
    public readonly showQol = () => this.userWithAccount() && !AppController.Instance.User.localSettings?.current?.qol?.seenQolOnboarding;
    // Health data
    public readonly hasHealthPermissions = () => AppController.Instance.User?.hasHealthDataPermissions.enabled;
    public readonly needsHealthPromptIOS = () => Platform.OS == 'ios' && (typeof AppController.Instance.User?.localSettings.current.healthPermissions == 'undefined' || !AppController.Instance.User?.localSettings.current.healthPermissions.seenPermissionPromptIOS);
}
