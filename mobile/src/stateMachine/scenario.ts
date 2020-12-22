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
import { OnboardingEnter } from './views/main/onboardingEnter';
import { OnboardingExit } from './views/main/onboardingExit';
import { MoodView, MoodViewParams } from './views/checkin/mood';
import { LocationView } from './views/checkin/location';
import { CheckInTypeView } from './views/checkin/selectCheckInType';
import { TextRecordView } from './views/checkin/recordTextCheckIn';
import { RecordView } from './views/checkin/recordAudioCheckIn';
import { NotificationsSettingsView } from './views/main/notificationsSettings';
import { EmailSettingsView } from './views/main/emailSettings';
import { SettingsView } from './views/main/settings';
import { ChangePasswordView } from './views/password/changePassword';
import { IntakeFormView } from './views/intakeForm';
import { ProfileView } from './views/main/profile';
import { HomeView } from './views/main/home';
import { EmptyView } from './views/emptyView';
import { CheckInDetailsView } from './views/main/checkInDetails';
import { ConsentView } from './views/login/consent';
import { FeelingsView } from './views/checkin/feelings';
import { GoalsView } from './views/main/goals';
import { RewardsView } from './views/rewardsView';
import { RecordPitureCheckinView } from './views/checkin/recordPictureCheckIn';

import Triggers = ScenarioTriggers;
import { VerificationCodeView } from './views/login/verificationCode';
import { NoInvitationView } from './views/login/noInvitation';
import { ResetPasswordView } from './views/password/resetPassword';

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

    [States.AskNotificationsPermissions]: {
        view: NotificationsPermissionView,
        exit: [
            { target: States.HomeRouter, trigger: Triggers.Submit },
            { target: States.HomeRouter, trigger: Triggers.Submit },
        ],
    },

    [States.HomeRouter]: {
        view: EmptyView,
        enter: [
            { condition: VM.homeReady },
        ],
        exit: [
            { priority: 0, target: States.Consent, condition: VM.showConsent },
            { priority: 1, target: States.OnboardingEnter, condition: VM.hasActiveOnboarding },
            { priority: 2, target: States.AskNotificationsPermissions, condition: VM.askNotifyPermissions },
            { priority: 4, target: States.IntakeForm, condition: VM.showAssessment },
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
            { priority: 3, target: States.Journal_SelectMood, condition: VM.openCreateJournal, params: <MoodViewParams> { openedByNotification: true } },
            { priority: 5, target: States.Goals, condition: VM.openGoals },
            { priority: 10, target: States.Home, condition: () => true },
        ],
        log: true,
    },

    [States.Home]: {
        view: HomeView,
        enter: [
            { trigger: GlobalTriggers.Home },
        ],
        exit: [
            { target: States.JournalDetail, trigger: Triggers.Primary },
            { target: States.IntakeForm, trigger: Triggers.Secondary },
            { target: States.Journal_SelectMood, trigger: Triggers.Submit },
        ],
    },

    [States.OnboardingEnter]: {
        view: OnboardingEnter,
        exit: [
            { target: States.Home, trigger: Triggers.Cancel },
            { target: States.Journal_SelectMood, trigger: Triggers.Primary },
        ],
    },
    [States.IntakeForm]: {
        view: IntakeFormView,
        exit: [
            { target: States.Home, trigger: [Triggers.Cancel, Triggers.Submit] },
            { target: States.Journal_SelectMood, trigger: Triggers.Secondary },
        ],
    },
    [States.Journal_SelectMood]: {
        view: MoodView,
        enter: [
            { trigger: GlobalTriggers.CreateStory },
        ],
        exit: [
            {
                target: VM.showLocation
                    ? States.Journal_Location
                    : States.Journal_SelectType,
                trigger: Triggers.Primary
            },
            { target: States.Journal_Feelings, trigger: Triggers.Secondary },
            CreateJournalCancelTransition,
        ],
    },
    [States.Journal_Feelings]: {
        view: FeelingsView,
        exit: [
            CreateJournalCancelTransition,
            { target: States.Journal_SelectMood, trigger: Triggers.Back },
            {
                target: VM.showLocation
                    ? States.Journal_Location
                    : States.Journal_SelectType,
                trigger: Triggers.Primary,
            },
        ],
    },
    [States.Journal_Location]: {
        view: LocationView,
        exit: [
            CreateJournalCancelTransition,
            { target: States.Journal_SelectMood, trigger: Triggers.Back },
            { target: States.Journal_SelectType, trigger: Triggers.Primary },
            { target: States.Journal_Feelings, trigger: Triggers.Secondary },
        ],
    },
    [States.Journal_SelectType]: {
        view: CheckInTypeView,
        exit: [
            CreateJournalCancelTransition,
            {
                target: VM.showLocation
                    ? States.Journal_Location
                    : States.Journal_SelectMood,
                trigger: Triggers.Back,
            },
            { target: States.Journal_AudioRecord, trigger: Triggers.Primary },
            { target: States.Journal_TextRecord, trigger: Triggers.Secondary },
            { target: States.Journal_PictureRecord, trigger: Triggers.Submit },
        ],
    },
    [States.Journal_TextRecord]: {
        view: TextRecordView,
        exit: [
            CreateJournalCancelTransition,
            { target: States.Journal_SelectType, trigger: Triggers.Back },
            { target: States.Journal_AfterSubmitRouter, trigger: Triggers.Primary },
        ],
    },
    [States.Journal_AudioRecord]: {
        view: RecordView,
        exit: [
            CreateJournalCancelTransition,
            { target: States.Journal_SelectType, trigger: Triggers.Back },
            { target: States.Journal_AfterSubmitRouter, trigger: Triggers.Primary },
        ],
    },
    [States.Journal_PictureRecord]: {
        view: RecordPitureCheckinView,
        exit: [
            CreateJournalCancelTransition,
            { target: States.Journal_SelectType, trigger: Triggers.Back },
            { target: States.Journal_AfterSubmitRouter, trigger: Triggers.Primary },
        ],
    },
    [States.Journal_AfterSubmitRouter]: {
        view: EmptyView,
        exit: [
            { priority: 1, target: States.OnboardingExit, condition: VM.showOnboardingExit },
            { priority: 2, target: States.NewRewardsView, condition: VM.showNewReward },
            { priority: 10, target: States.Home, condition: () => true },
        ],
    },

    [States.NewRewardsView]: {
        view: RewardsView,
        exit: [
            { target: States.Home, trigger: [Triggers.Back, Triggers.Cancel, Triggers.Submit] },
        ],
    },

    [States.OnboardingExit]: {
        view: OnboardingExit,
        exit: [
            { target: States.Home, trigger: [Triggers.Back, Triggers.Cancel] },
        ],
    },

    [States.Goals]: {
        view: GoalsView,
        enter: [
            { trigger: GlobalTriggers.Goals },
        ],
    },

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
            { target: States.ConfirmAccount, trigger: Triggers.Secondary },
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
        ],
    },
};
