
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

    OnboardingEnter,
    AskNotificationsPermissions,

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

    // LIFE DOMAINS block
    Choose_Domain,
    Domain_Details,
    Select_Domain,
    Three_Selected,
    Choose_end,
    View_Domains,
    Domain_Details_after_ViewDomains,

    // Strategies block
    Choose_Strategies,
    Focus_Strategies,
    Strategy_Details,
    Strategy_Details2,
    Strategy_Details3,

    Past_Strategies,

    Focus_Domains,

    // QoL Block
    qol_Question,
    End_Qol,
    StartQol,
    QolQuestion,
    EndQol,
}
