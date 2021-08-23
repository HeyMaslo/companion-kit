import AppController from 'src/controllers';
import AppViewModel from 'src/viewModels';
import * as Features from 'common/constants/features';

import { NotificationTypes } from 'common/models/Notifications';

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

    public readonly askNotifyPermissions = () => AppController.Instance.User && !AppController.Instance.User?.notifications.permissionsAsked;

    public readonly homeReady = () => !this.userPreparing() && this.userConfirmed();

    public readonly hasActiveOnboarding = () => process.appFeatures.MOBILE_ONBOARDING_ENABLED === true && this.userWithAccount() && AppController.Instance.User.onboardingDayIndex != null && !AppController.Instance.User.hasSeenOnboarding;
    public readonly showOnboardingExit = () => process.appFeatures.MOBILE_ONBOARDING_ENABLED === true && AppViewModel.Instance.CreateCheckIn.beforeSubmitState?.onboardingIndex != null;
    public readonly showNewReward = () => process.appFeatures.CLIENT_REWARDS_ENABLED === true && AppViewModel.Instance.CreateCheckIn.beforeSubmitState?.rewardLevel < AppController.Instance.User.rewards?.level;

    // NOTIFICATIONS
    private get _currentNotification() { return AppController.Instance.User.notifications.openedNotification; }
    private readonly _canReactOnNotification = () => !AppViewModel.Instance.CreateCheckIn.inProgress;
    public readonly notificationReceived = () => !!this._currentNotification?.type && this.homeReady() && this._canReactOnNotification();

    private readonly _notificationType = (...types: NotificationTypes[]) => this._canReactOnNotification() && types.includes(this._currentNotification?.type);
    public readonly openCreateJournal = () => this._notificationType(NotificationTypes.Retention, NotificationTypes.CustomPrompt, NotificationTypes.TriggerPhrase);
    public readonly openGoals = () => this._notificationType(NotificationTypes.NewGoals);
    // public readonly openAssessmentForm = () => notificationOpened(NotificationTypes.Assessment);

    public readonly showConsent = () => process.appFeatures.MOBILE_SHOW_CONSENT === true && this.userConfirmed() && !AppController.Instance.User.user?.client?.consentAccepted;
    public readonly showAssessment = () => process.appFeatures.ASSESSMENTS_ENABLED === true && this.userWithAccount() && !!AppController.Instance.User.assessments.nextFormTypeAvailable;
    public readonly showQol = () => this.userWithAccount() && !AppController.Instance.User.localSettings?.current?.qol?.seenQolOnboarding;
}
