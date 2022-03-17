import { observable } from 'mobx';
import { GlobalScenario, ScenarioTriggers, StateTransition, NavigationStates } from './abstractions';
import { GlobalTriggers } from './globalTriggers';
import { States } from './states';
import { ScenarioViewModel } from './scenario.viewModel';

import { StartView } from './views/login/start';
import { WelcomeView } from './views/login/welcome';
import { SignInView } from './views/login/signIn';
import { PasswordSignInView } from './views/password/passwordSignIn';
import { SetPasswordView } from './views/password/setPassword';
import { ConfirmAccountView } from './views/login/confirmAccount';
import { MissingAccountView } from './views/login/missingAccount';
import { NotificationsPermissionView } from './views/login/notificationsPermission';
// These are old maslo screens (not our onboarding)
// import { OnboardingEnter } from './views/main/onboardingEnter';
// import { OnboardingExit } from './views/main/onboardingExit';
import { MoodView, MoodViewParams } from './views/checkin/mood';
// import { LocationView } from './views/checkin/location';
// import { CheckInTypeView } from './views/checkin/selectCheckInType';
// import { TextRecordView } from './views/checkin/recordTextCheckIn';
// import { RecordView } from './views/checkin/recordAudioCheckIn';
import { NotificationsSettingsView } from './views/main/notificationsSettings';
import { CustomizeNotificationsView } from './views/notificationCustomize/CustomizeNotifications';
import { EmailSettingsView } from './views/main/emailSettings';
import { SettingsView } from './views/main/settings';
import { ChangePasswordView } from './views/password/changePassword';
import { IntakeFormView } from './views/intakeForm';
import { ProfileView } from './views/main/profile';
import { HomeView } from './views/main/home';
import { EmptyView } from './views/emptyView';
import { CheckInDetailsView } from './views/main/checkInDetails';
import { ConsentView } from './views/login/consent';
// import { FeelingsView } from './views/checkin/feelings';
// import { GoalsView } from './views/main/goals';
// import { RewardsView } from './views/rewardsView';
// import { RecordPitureCheckinView } from './views/checkin/recordPictureCheckIn';
import { NotificationsTimeOnboardingView } from './views/onboarding/NotificationsTimeOnboarding';
import { CustomizeNotificationsOnboardingView } from './views/onboarding/CustomizeNotificationsOnboarding';
import { ReviewNotificationsOnboardingView } from './views/onboarding/ReviewNotificationsOnboarding';
import { BDMentionNotificationsOnboardingView } from './views/onboarding/BDMentionNotificationsOnboarding';
import { ViewAffirmationView } from './views/ViewAffirmation'

import { ChooseDomainView } from './views/lifeDomains/chooseDomain';
import { DomainDetailsView } from './views/lifeDomains/domainDetails';
import { ChooseDomainEndView } from './views/lifeDomains/chooseDomainEnd';
import { ViewDomainsView } from './views/lifeDomains/viewDomains';

import { ChooseStrategiesView } from './views/strategies/ChooseStrategiesView';
import { ReviewStrategiesView } from './views/strategies/ReviewStrategiesView';
import { StrategyDetailsView } from './views/strategies/StrategyDetailsView';
import { AllStrategiesView } from './views/strategies/AllStrategiesView';

import { YourFocusDomainsView } from './views/YourFocusDomainsView';

import { QolStartView } from './views/qol/startQOL';
import { QolEndView } from './views/qol/endQOL';
import { QolQuestion } from './views/qol/qolQuestion';
import { HealthConsentView } from './views/healthData/healthConsent';
import { HealthScopesView } from './views/healthData/healthScopes';

import { QolHistoryMainView } from './views/qol/history/qolHistoryMain';
import { QolTimelineView } from './views/qol/history/qolTimeline';
import { QolHistoryStrategiesView } from './views/strategies/QolHistoryStrategiesView';

import Triggers = ScenarioTriggers;
import { VerificationCodeView } from './views/login/verificationCode';
import { NoInvitationView } from './views/login/noInvitation';
import { ResetPasswordView } from './views/password/resetPassword';
import { Platform } from 'react-native';
import { QolOnboardingVideoView } from './views/onboarding/QolOnboardingVideoView';
import { HealthOnboardingVideoView } from './views/onboarding/HealthOnboardingVideoView';
import { HealthDataExplanierView } from './views/onboarding/HealthDataExplanierView';
import { HealthDataCollectionCheckView } from './views/onboarding/HealthDataCollectionCheckView';
import { AfterHealthPromptView } from './views/onboarding/AfterHealthPromptView';
import { SleepView } from './views/checkin/sleep';
import { DailyCheckInStartView } from './views/checkin/startDailyCheckIn';
import { DailyCheckInEndView } from './views/checkin/endDailyCheckIn';
import { ReviewStrategiesViewOnboarding } from './views/strategies/ReviewStrategiesViewOnboarding';
import { StrategyPreviewView } from './views/strategies/StrategyPreviewView';

const CreateJournalCancelTransition: StateTransition<States> = {
    target: States.Home,
    trigger: ScenarioTriggers.Cancel,
};

const VM = new ScenarioViewModel();

export const currentState = observable.object({
    value: null as States,
});

export const BackTransition: StateTransition<States> = { target: NavigationStates.GoBack, trigger: Triggers.Back };

export const MasloScenario: GlobalScenario<States> = {
    startState: States.Start,

    [States.Undefined]: {
        view: null,
    },

    [States.Start]: {
        view: StartView,
        enter: { trigger: GlobalTriggers.SignOut },
        exit: [
            { target: States.Welcome, trigger: Triggers.Primary },
        ],
    },

    [States.Welcome]: {
        view: WelcomeView,
        exit: [
            { target: States.SignInWithEmail, trigger: Triggers.Secondary },
            { target: States.HomeRouter, trigger: Triggers.Primary },
        ],
    },

    [States.HealthOnboardingVideo]: {
        view: HealthOnboardingVideoView,
        exit: [
            { target: States.HealthDataExplainer, trigger: Triggers.Next },
        ],
    },

    [States.HealthDataExplainer]: {
        view: HealthDataExplanierView,
        exit: [
            { target: States.HealthDataCollectionCheck, trigger: Triggers.Next },
        ],
    },

    [States.HealthDataCollectionCheck]: {
        view: HealthDataCollectionCheckView,
        exit: [
            { target: States.HealthConsent, trigger: Triggers.Next },
        ],
    },

    [States.HealthConsent]: {
        view: HealthConsentView,
        exit: [
            { target: States.AfterHealthPrompt, trigger: Triggers.Submit },
        ],
    },

    [States.AfterHealthPrompt]: {
        view: AfterHealthPromptView,
        exit: [
            { target: States.HomeRouter, trigger: Triggers.Next },
        ],
    },

    [States.HealthScopes]: {
        view: HealthScopesView,
        exit: [
            { target: States.Settings, trigger: Triggers.Back },
            { target: States.Home, trigger: Triggers.Cancel },
        ],
    },

    [States.SignInWithEmail]: {
        view: SignInView,
        exit: [
            { target: States.Welcome, trigger: Triggers.Back },
            { target: States.EnterVerificationCode, trigger: Triggers.Primary },
            { target: States.SignInPassword, trigger: Triggers.Submit },
            { target: States.SetPassword, trigger: Triggers.Secondary },
            { target: States.NoInvitationEmail, trigger: Triggers.Cancel },
        ],
    },

    [States.NoInvitationEmail]: {
        view: NoInvitationView,
        exit: [
            { target: States.SignInWithEmail, trigger: Triggers.Primary },
            { target: States.Welcome, trigger: Triggers.Back },
        ],
    },

    [States.EnterVerificationCode]: {
        view: VerificationCodeView,
        exit: [
            // { target: States.SignInWithEmail, trigger: Triggers.Submit },
            { target: States.SetPassword, trigger: Triggers.Submit },
            { target: States.ResetPassword, trigger: Triggers.Primary },
            { target: States.Welcome, trigger: Triggers.Back },
        ],
    },

    [States.SignInPassword]: {
        view: PasswordSignInView,
        exit: [
            { target: States.SignInWithEmail, trigger: Triggers.Back },
            { target: States.EnterVerificationCode, trigger: Triggers.Secondary },
        ],
    },

    [States.SetPassword]: {
        view: SetPasswordView,
        enter: { condition: VM.shouldCreatePassword },
        exit: [
            { target: States.SignInWithEmail, trigger: Triggers.Cancel },
        ],
    },

    [States.ResetPassword]: {
        view: ResetPasswordView,
        exit: [
            { target: States.SignInWithEmail, trigger: Triggers.Cancel },
        ],
    },

    [States.ConfirmAccount]: {
        view: ConfirmAccountView,
        enter: { condition: VM.confirmAccount },
        exit: [
            BackTransition,
        ],
    },

    [States.MissingAccount]: {
        view: MissingAccountView,
        enter: { condition: VM.missingAccount },
    },

    [States.Consent]: {
        view: ConsentView,
        exit: [
            { target: States.HomeRouter, trigger: Triggers.Submit },
        ],
    },

    [States.NotificationsTimeOnboarding]: {
        view: NotificationsTimeOnboardingView,
        exit: [
            { target: States.CustomizeNotificationsOnboarding, trigger: Triggers.Next },
            { target: States.Home, trigger: Triggers.Back },
        ],
    },

    [States.CustomizeNotificationsOnboarding]: {
        view: CustomizeNotificationsOnboardingView,
        exit: [
            { target: States.BDMentionNotifcationsOnboarding, trigger: Triggers.Next },
            { target: States.NotificationsTimeOnboarding, trigger: Triggers.Back },
        ],
    },

    [States.BDMentionNotifcationsOnboarding]: {
        view: BDMentionNotificationsOnboardingView,
        exit: [
            { target: States.CustomizeNotificationsOnboarding, trigger: Triggers.Back },
            { target: Platform.OS == 'ios' ? States.NotificationsPermission : States.ReviewNotifcationsOnboarding, trigger: Triggers.Next },
        ],
    },

    [States.NotificationsPermission]: {
        view: NotificationsPermissionView,
        exit: [
            { target: States.ReviewNotifcationsOnboarding, trigger: Triggers.Submit },
        ],
    },

    [States.ReviewNotifcationsOnboarding]: {
        view: ReviewNotificationsOnboardingView,
        exit: [
            { target: States.Home, trigger: Triggers.Next },
        ],
    },

    [States.HomeRouter]: {
        view: EmptyView,
        enter: [
            { condition: VM.homeReady },
        ],
        exit: [
            // old maslo screens
            // { priority: 0, target: States.Consent, condition: VM.showConsent },
            // { priority: 1, target: States.OnboardingEnter, condition: VM.hasActiveOnboarding },

            // Onboarding
            { priority: 0, target: States.HealthOnboardingVideo, condition: Platform.OS == 'ios' ? VM.needsHealthPromptIOS : VM.needsHealthPromptAndroid },
            // { priority: 2, target: States.HealthConsent, condition: Platform.OS == 'ios' ? VM.needsHealthPromptIOS : VM.needsHealthPermissions },
            { priority: 3, target: States.QolOnboardingVideo, condition: VM.showOnboardingQol },
            { priority: 4, target: States.Choose_Domain, condition: VM.onboardingNeedsToChooseDomains },
            { priority: 5, target: States.Choose_Strategies, condition: VM.needsToChooseStrategies },
            { priority: 6, target: States.NotificationsTimeOnboarding, condition: VM.onboardingNeedsToScheduleNotifs }, // VM.askNotifyPermissions
            // Normal usuage
            { priority: 10, target: States.Home, condition: () => true },

        ],
        log: true,
    },

    [States.NotificationsRouter]: {
        view: EmptyView,
        enter: [
            { condition: VM.notificationReceived, compose: 'and', trigger: GlobalTriggers.NotificationReceived },
        ],
        exit: [
            { priority: 3, target: States.View_Affirmation, condition: () => true },
            // { priority: 3, target: States.Journal_SelectMood, condition: VM.openCreateJournal, params: <MoodViewParams>{ openedByNotification: true } },
            // { priority: 5, target: States.Goals, condition: VM.openGoals },
            // { priority: 10, target: States.Home, condition: () => true },
        ],
        log: true,
    },

    [States.Home]: {
        view: HomeView,
        enter: [
            { trigger: GlobalTriggers.Home },
        ],
        exit: [
            // old maslo screens
            // { target: States.JournalDetail, trigger: Triggers.Primary },
            // { target: States.IntakeForm, trigger: Triggers.Secondary },
            { target: States.StartQol, trigger: Triggers.Tertiary },
            { target: States.StartDailyCheckIn, trigger: Triggers.Submit },
            { target: States.QolQuestion, trigger: Triggers.Quaternary },
            { target: States.HealthScopes, trigger: Triggers.Quinary },
            { target: States.Focus_Domains, trigger: Triggers.Next },
            { target: States.Choose_Domain, trigger: Triggers.Senary },
        ],
    },

    // [States.OnboardingEnter]: {
    //     view: OnboardingEnter,
    //     exit: [
    //         { target: States.Home, trigger: Triggers.Cancel },
    //         { target: States.Journal_SelectMood, trigger: Triggers.Primary },
    //     ],
    // },

    // [States.IntakeForm]: {
    //     view: IntakeFormView,
    //     exit: [
    //         { target: States.Home, trigger: [Triggers.Cancel, Triggers.Submit] },
    //         { target: States.Journal_SelectMood, trigger: Triggers.Secondary },
    //     ],
    // },

    [States.StartDailyCheckIn]: {
        view: DailyCheckInStartView,
        exit: [
            { target: States.DailyCheckInSleep, trigger: Triggers.Submit },
            { target: States.Home, trigger: Triggers.Cancel },
        ],
    },

    [States.DailyCheckInSleep]: {
        view: SleepView,
        exit: [
            { target: States.DailyCheckInMood, trigger: Triggers.Primary },
            { target: States.Home, trigger: Triggers.Cancel },
        ],
    },

    [States.DailyCheckInMood]: {
        view: MoodView,
        exit: [
            { target: States.EndDailyCheckIn, trigger: Triggers.Primary },
            { target: States.DailyCheckInSleep, trigger: Triggers.Back },
            { target: States.Home, trigger: Triggers.Cancel },
        ],
    },

    [States.EndDailyCheckIn]: {
        view: DailyCheckInEndView,
        exit: [
            { target: States.Home, trigger: Triggers.Submit },
            { target: States.DailyCheckInMood, trigger: Triggers.Back },
            { target: States.Home, trigger: Triggers.Cancel },
        ],
    },

    // [States.Journal_Feelings]: {
    //     view: FeelingsView,
    //     exit: [
    //         CreateJournalCancelTransition,
    //         { target: States.Journal_SelectMood, trigger: Triggers.Back },
    //         {
    //             target: VM.showLocation
    //                 ? States.Journal_Location
    //                 : States.Journal_SelectType,
    //             trigger: Triggers.Primary,
    //         },
    //     ],
    // },
    // [States.Journal_Location]: {
    //     view: LocationView,
    //     exit: [
    //         CreateJournalCancelTransition,
    //         { target: States.Journal_SelectMood, trigger: Triggers.Back },
    //         { target: States.Journal_SelectType, trigger: Triggers.Primary },
    //         { target: States.Journal_Feelings, trigger: Triggers.Secondary },
    //     ],
    // },
    // [States.Journal_SelectType]: {
    //     view: CheckInTypeView,
    //     exit: [
    //         CreateJournalCancelTransition,
    //         {
    //             target: VM.showLocation
    //                 ? States.Journal_Location
    //                 : States.Journal_SelectMood,
    //             trigger: Triggers.Back,
    //         },
    //         { target: States.Journal_AudioRecord, trigger: Triggers.Primary },
    //         { target: States.Journal_TextRecord, trigger: Triggers.Secondary },
    //         { target: States.Journal_PictureRecord, trigger: Triggers.Submit },
    //     ],
    // },
    // [States.Journal_TextRecord]: {
    //     view: TextRecordView,
    //     exit: [
    //         CreateJournalCancelTransition,
    //         { target: States.Journal_SelectType, trigger: Triggers.Back },
    //         { target: States.Journal_AfterSubmitRouter, trigger: Triggers.Primary },
    //     ],
    // },
    // [States.Journal_AudioRecord]: {
    //     view: RecordView,
    //     exit: [
    //         CreateJournalCancelTransition,
    //         { target: States.Journal_SelectType, trigger: Triggers.Back },
    //         { target: States.Journal_AfterSubmitRouter, trigger: Triggers.Primary },
    //     ],
    // },
    // [States.Journal_PictureRecord]: {
    //     view: RecordPitureCheckinView,
    //     exit: [
    //         CreateJournalCancelTransition,
    //         { target: States.Journal_SelectType, trigger: Triggers.Back },
    //         { target: States.Journal_AfterSubmitRouter, trigger: Triggers.Primary },
    //     ],
    // },
    // [States.Journal_AfterSubmitRouter]: {
    //     view: EmptyView,
    //     exit: [
    //         // { priority: 1, target: States.OnboardingExit, condition: VM.showOnboardingExit },
    //         // { priority: 2, target: States.NewRewardsView, condition: VM.showNewReward },
    //         { priority: 10, target: States.Home, condition: () => true },
    //     ],
    // },

    // [States.NewRewardsView]: {
    //     view: RewardsView,
    //     exit: [
    //         { target: States.Home, trigger: [Triggers.Back, Triggers.Cancel, Triggers.Submit] },
    //     ],
    // },

    // [States.OnboardingExit]: {
    //     view: OnboardingExit,
    //     exit: [
    //         { target: States.Home, trigger: [Triggers.Back, Triggers.Cancel] },
    //     ],
    // },

    // [States.Goals]: {
    //     view: GoalsView,
    //     enter: [
    //         { trigger: GlobalTriggers.Goals },
    //     ],
    // },

    [States.Profile]: {
        view: ProfileView,
        enter: { trigger: GlobalTriggers.Profile },
        exit: [
            { target: States.Settings, trigger: Triggers.Primary },
            { target: States.IntakeForm, trigger: Triggers.Secondary },
        ],
    },

    [States.JournalDetail]: {
        view: CheckInDetailsView,
        exit: [
            { target: States.Home, trigger: [Triggers.Back] },
        ],
    },

    [States.Settings]: {
        view: SettingsView,
        enter: [
            { trigger: GlobalTriggers.Settings },
        ],
        exit: [
            { target: States.Profile, trigger: Triggers.Back },
            { target: States.NotificationsSettings, trigger: Triggers.Primary },
            { target: States.ChangePassword, trigger: Triggers.Submit },
            // { target: States.ConfirmAccount, trigger: Triggers.Secondary },
            { target: States.HealthScopes, trigger: Triggers.Secondary },
        ],
    },

    [States.EmailSettings]: {
        view: EmailSettingsView,
        enter: { trigger: GlobalTriggers.EmailSettings },
        exit: [
            { target: States.Settings, trigger: Triggers.Back },
        ],
    },

    [States.ChangePassword]: {
        view: ChangePasswordView,
        enter: { trigger: GlobalTriggers.SetNewPassword },
        exit: [
            { target: States.Settings, trigger: [Triggers.Back, Triggers.Primary] },
        ],
    },

    [States.NotificationsSettings]: {
        view: NotificationsSettingsView,
        enter: { trigger: GlobalTriggers.NotifictaionSettings },
        exit: [
            { target: States.Settings, trigger: [Triggers.Back] },
            { target: States.NotificationsCustomize, trigger: [Triggers.Next] },
        ],
    },

    [States.NotificationsCustomize]: {
        view: CustomizeNotificationsView,
        exit: [
            { target: States.NotificationsSettings, trigger: [Triggers.Back] },
        ],
    },

    [States.Choose_Domain]: {
        view: ChooseDomainView,
        exit: [
            { target: States.Home, trigger: [Triggers.Cancel] },
            { target: States.Domain_Details, trigger: [Triggers.Submit] },
            { target: States.Choose_end, trigger: [Triggers.Next] },
            { target: States.Subdomain_Details, trigger: [Triggers.Quaternary] },
        ]
    },

    [States.Domain_Details]: {
        view: DomainDetailsView,
        exit: [
            { target: States.Choose_Domain, trigger: [Triggers.Cancel] },
            { target: States.All_Strategies, trigger: [Triggers.Next] },
            // { target: States.Strategy_Details_after_Domain_Details, trigger: [Triggers.Tertiary] },
            { target: States.Strategy_Preview_after_Domain_Details, trigger: [Triggers.Tertiary] },
        ]
    },

    [States.Domain_Details_after_ViewDomains]: {
        view: DomainDetailsView,
        exit: [
            { target: States.View_Domains, trigger: [Triggers.Cancel] },
            { target: States.All_Strategies_after_ViewDomains, trigger: [Triggers.Next] },
            { target: States.Strategy_Details_after_Domain_Details_after_ViewDomains, trigger: [Triggers.Tertiary] },
        ]
    },

    [States.Choose_end]: {
        view: ChooseDomainEndView,
        exit: [
            { target: States.Choose_Domain, trigger: [Triggers.Back] },
            { target: States.Choose_Strategies, trigger: [Triggers.Submit] },
        ]
    },

    [States.Subdomain_Details]: {
        view: DomainDetailsView,
        exit: [
            { target: States.Choose_Domain, trigger: [Triggers.Cancel] },
        ]
    },

    [States.Choose_Strategies]: {
        view: ChooseStrategiesView,
        exit: [
            { target: States.Home, trigger: [Triggers.Cancel] },
            { target: States.Choose_Domain, trigger: [Triggers.Back] },
            {
                target: VM.isCurrentlyOnboarding ? States.Review_Strategies_Onboarding
                    : States.Review_Strategies, trigger: [Triggers.Submit]
            },
            { target: States.Strategy_Details_after_Choose_Strategies, trigger: [Triggers.Tertiary] },
        ]
    },

    [States.Review_Strategies]: {
        view: ReviewStrategiesView,
        exit: [
            { target: States.Home, trigger: [Triggers.Cancel] },
            { target: States.Choose_Strategies, trigger: [Triggers.Back] },
            { target: States.Strategy_Details_after_Review_Strategies, trigger: [Triggers.Tertiary] },
            { target: States.Home, trigger: [Triggers.Submit] },
        ]
    },

    [States.Review_Strategies_Onboarding]: {
        view: ReviewStrategiesViewOnboarding,
        exit: [
            { target: States.Choose_Strategies, trigger: [Triggers.Back] },
            { target: States.Strategy_Details_after_Review_Strategies, trigger: [Triggers.Tertiary] },
            { target: States.HomeRouter, trigger: [Triggers.Submit] },
        ]
    },

    [States.Strategy_Preview_after_Domain_Details]: {
        view: StrategyPreviewView,
        exit: [
            { target: States.Domain_Details, trigger: [Triggers.Back] },
            { target: States.Strategy_Details_after_Domain_Details, trigger: [Triggers.Next] },
        ]
    },

    [States.Strategy_Details_after_Choose_Strategies]: {
        view: StrategyDetailsView,
        exit: [
            { target: States.Choose_Strategies, trigger: [Triggers.Back] },
        ]
    },

    [States.Strategy_Details_after_Review_Strategies]: {
        view: StrategyDetailsView,
        exit: [
            { target: States.Review_Strategies, trigger: [Triggers.Back] },
        ]
    },

    [States.Strategy_Details_after_Focus_Domains]: {
        view: StrategyDetailsView,
        exit: [
            { target: States.Focus_Domains, trigger: [Triggers.Back] },
        ]
    },

    [States.Strategy_Details_after_Domain_Details]: {
        view: StrategyDetailsView,
        exit: [
            { target: States.Strategy_Preview_after_Domain_Details, trigger: [Triggers.Back] },
        ]
    },

    [States.Strategy_Details_after_Domain_Details_after_ViewDomains]: {
        view: StrategyDetailsView,
        exit: [
            { target: States.Domain_Details_after_ViewDomains, trigger: [Triggers.Back] },
        ]
    },

    [States.Strategy_Details_after_QolHistory_Strategies]: {
        view: StrategyDetailsView,
        exit: [
            { target: States.QolHistory_Strategies, trigger: [Triggers.Back] },
        ]
    },

    [States.All_Strategies]: {
        view: AllStrategiesView,
        exit: [
            { target: States.Domain_Details, trigger: [Triggers.Cancel] },
        ]
    },

    [States.All_Strategies_after_ViewDomains]: {
        view: AllStrategiesView,
        exit: [
            { target: States.Domain_Details_after_ViewDomains, trigger: [Triggers.Cancel] },
        ]
    },

    [States.Focus_Domains]: {
        view: YourFocusDomainsView,
        exit: [
            { target: States.Home, trigger: [Triggers.Cancel] },
            { target: States.Strategy_Details_after_Focus_Domains, trigger: [Triggers.Tertiary] },
            { target: States.View_Domains, trigger: [Triggers.Next] },
        ]
    },

    [States.View_Domains]: {
        view: ViewDomainsView,
        exit: [
            { target: States.Home, trigger: [Triggers.Cancel] },
            { target: States.Focus_Domains, trigger: [Triggers.Back] },
            { target: States.Domain_Details_after_ViewDomains, trigger: [Triggers.Tertiary] },
        ]
    },

    [States.QolOnboardingVideo]: {
        view: QolOnboardingVideoView,
        exit: [
            { target: States.StartQol, trigger: Triggers.Next },
        ],
    },

    [States.StartQol]: {
        view: QolStartView,
        exit: [
            { target: States.Home, trigger: [Triggers.Cancel] },
            { target: States.QolQuestion, trigger: [Triggers.Submit] },
        ]
    },

    [States.QolQuestion]: {
        view: QolQuestion,
        exit: [
            { target: States.Home, trigger: [Triggers.Cancel] },
            { target: States.EndQol, trigger: [Triggers.Submit] },
        ]
    },

    [States.EndQol]: {
        view: QolEndView,
        exit: [
            { target: VM.isCurrentlyOnboarding ? States.HomeRouter : States.Home, trigger: [Triggers.Cancel] },
        ]
    },

    [States.QolHistory]: {
        view: QolHistoryMainView,
        enter: [
            { trigger: GlobalTriggers.QolHistory }
        ],
        exit: [
            { target: States.Home, trigger: [Triggers.Back] },
            { target: States.QolHistoryTimline, trigger: [Triggers.Submit] },
        ]
    },

    [States.QolHistoryTimline]: {
        view: QolTimelineView,
        exit: [
            { target: States.QolHistory, trigger: [Triggers.Back] },
            { target: States.Home, trigger: [Triggers.Cancel] },
            { target: States.QolHistory_Strategies, trigger: [Triggers.Secondary] },
        ]
    },

    [States.QolHistory_Strategies]: {
        view: QolHistoryStrategiesView,
        exit: [
            { target: States.QolHistoryTimline, trigger: [Triggers.Back] },
            { target: States.Strategy_Details_after_QolHistory_Strategies, trigger: [Triggers.Tertiary] },
        ]
    },

    [States.View_Affirmation]: {
        view: ViewAffirmationView,
        exit: [
            { target: States.Home, trigger: [Triggers.Back] },
        ]
    },
};
