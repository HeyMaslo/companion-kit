
// NOTE Order makes a difference: latter one has more priority
// if on the same frame two states will compete
// (enter condition of both will be satisfied)
// a-la routes
export enum States {
    Undefined = 0,

    // Start Block
    Start = 1,

    // Sign In Block
    Welcome,
    SignInWithEmail,
    SignInPassword,
    NoInvitationEmail,
    EnterVerificationCode,

    // Main Block
    SetPassword,
    ResetPassword,
    ConfirmAccount,
    NoAccount,

    MissingAccount,

    HomeRouter,
    NotificationsRouter,

    Consent,

    IntakeForm,
    Home,
    JournalDetail,

    // Daily Check In
    StartDailyCheckIn,
    DailyCheckInSleep,
    DailyCheckInMood,
    EndDailyCheckIn,

    OnboardingEnter,
    HealthOnboardingVideo,
    HealthDataExplainer,
    HealthDataCollectionCheck,
    AfterHealthPrompt,
    QolOnboardingVideo,
    NotificationsPermission,
    NotificationsTimeOnboarding,
    CustomizeNotificationsOnboarding,
    BDMentionNotifcationsOnboarding,
    ReviewNotifcationsOnboarding,

    // Create Journal Block
    Journal_SelectMood,
    Journal_Feelings,
    Journal_Location,
    Journal_SelectType,
    Journal_TextRecord,
    Journal_AudioRecord,
    Journal_PictureRecord,

    Journal_AfterSubmitRouter,

    NewRewardsView,
    OnboardingExit,

    // Settings block
    Goals,
    Profile,
    Settings,
    EmailSettings,
    ChangePassword,
    NotificationsSettings,
    NotificationsCustomize,

    // LIFE DOMAINS block
    Focus_Domains,
    Choose_Domain,
    Domain_Details,
    Choose_end,
    View_Domains,
    Domain_Details_after_ViewDomains,
    Subdomain_Details,

    // Strategies block
    Choose_Strategies,
    Review_Strategies,
    Review_Strategies_Onboarding,

    Strategy_Preview_after_Domain_Details,

    Strategy_Details_after_Choose_Strategies,
    Strategy_Details_after_Review_Strategies,
    Strategy_Details_after_Focus_Domains,
    Strategy_Details_after_Domain_Details,
    Strategy_Details_after_Domain_Details_after_ViewDomains,
    Strategy_Details_after_QolHistory_Strategies,
    All_Strategies,
    All_Strategies_after_ViewDomains,
    QolHistory_Strategies,

    Resources,

    // QoL Block
    qol_Question,
    End_Qol,
    StartQol,
    QolQuestion,
    EndQol,
    // Health Block
    HealthConsent,
    HealthScopes,

    QolHistory,
    QolHistoryTimline,

    View_Affirmation,
}
