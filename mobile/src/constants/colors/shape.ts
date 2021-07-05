export type ProjectColorsSchema = {
    // ========== PERSONA ==============

    personaColors: string[];
    // ========== TYPOGRAPHY ==============

    typography: {
        h1: string;
        h2: string;
        h3: string;
        h4: string;
        p1: string;
        p2: string;
        p3: string;
        p4: string;
        btnTitle: string;
        labelMedium: string;
        labelSmall: string;
    };

    // ========== COMPONENTS ==============

    // Checkbox
    checkboxChecked: string;

    // AudioPlayer
    audioPlayerTriangleColor: string;
    audioPlayerRectBgColor: string;
    audioPlayerThumbAndActivityColor: string;
    audioPlayerSliderMinTrack: string;
    audioPlayerAltColor: string;

    // BubbleChart
    bubbleChartSVGText: string;
    bubbleChartDarkTheme: {
        mainTextColor: {
            large: string;
            small: string;
        };
        fill: {
            large: string;
            small: string;
        };
    };
    bubbleChartLightTheme: {
        mainTextColor: {
            large: string;
            small: string;
        };
        fill: {
            large?: string;
            small: string;
        };
        stroke: {
            large: string;
            small: string;
        };
    };

    // Button
    button: {
        defaultBg: string;
        defaultBorder: string;
        defaultUnderlayColor: string;
        disabledBg: string;
        disabledBorder: string;
        disabledText: string;
        transparentText: string;
        buttonForm: {
            bg: string;
            border: string;
            text: string;
            underlay: string;
        };
        extendButtonText: string;
    };

    // Dots
    dotBg: string;
    dotActiveBg: string;

    // GradientChart
    gradientChartSentimentColor: string;
    gradientChartDateColor: string;
    gradientChartSvgBg: string;

    // Link
    linkDefault: string;

    // ProgressBarCircle
    ProgressBarCircle: {
        progressBarCircleLine: string;
        ProgressBarCircleText: string;
        gradColor1: string;
        gradColor2: string;
        gradColor3: string;
        gradColor4: string;
        gradColor5: string;
    };

    // ProgressButton
    progressButtonIndicatorBg: string;
    progressButtonText: string;
    progressButtonloadWrapBg: string;

    // PromptModal
    promptModalBg: string;
    promptModalMessage: string;
    promptModalTitle: string;

    // Input
    inputText: string;
    inputPlaceholder: string;
    inputErrorText: string;

    // GradientChartBlock
    gradientChartBlockTitle1: string;
    gradientChartBlockTitle2: string;

    // MoodSlider
    moodSlider: {
        thumbTintColor: string;
    };

    card: {
        title: string;
        description: string;
        underlay: {
            primary: string;
            secondary: string;
        };
    };

    // StoryCard
    storyCard: {
        bg: string;
        title: string;
        date: string;
        privacyText: string;
    };

    // TipCard
    tipCardBg: string;
    tipCardTitle: string;
    tipCardInfo: string;

    // LocationCardS
    locationCardS: {
        cardTitle: {
            default: string;
            active: string;
        };
        cardLayerBg: string;
    };

    // GradientView
    gradientView: {
        fallbackColor: string[];
    };

    // radioButton
    radioButton: {
        checkedBg: string;
    };

    placeholder: {
        bg: string;
        text: string;
    };

    selectItem: {
        bg: string;
        activeBg: string;
        activeText: string;
        activeBorder: string;
    };

    // Switch
    switch: {
        activeBg: string;
        inactiveBg: string;
    };

    // Toaster
    toaster: {
        bg: string;
        text: string;
    };

    // ========== BASE ==============

    pageBg: string;

    moodColors: {
        Undefined: string;
        VeryPositive: string;
        Positive: string;
        Mixed: string;
        Difficult: string;
        Rough: string;
    };

    borderColor: string;

    gradientMaskColor1: string;
    gradientMaskColor2: string;

    secondarySubtitle: string;

    // ========== SCREENS ==============

    // ConsentView
    consent: {
        textBlockBg: string;
        contentHeading: string;
        contentPrimaryColor: string;
        contentBodyText: string;
        buttonDisabledBg: string;
        buttonDisabledText: string;
    };

    // EnterPasswordView
    enterPassword: {
        linkColor: string;
    };

    // HomeView
    home: {
        headingTitle: string;
        bg: string;
    };

    // NotificationsSettingsView
    notificationsSettings: {
        exactCard: {
            bg: string;
        };
        exact: {
            title: string;
            desc: string;
        };
    };

    // ProfileView
    profile: {
        changePhoto: {
            border: string;
            photoBg: string;
        };
        subTextPrimaryColor: string;
        subTextSecondaryColor: string;
        settingsBg: string;
    };

    // RecordView
    record: {
        counterTextColor: string;
        triangleBorder: string;
        pauseSquareBg: string;
        controlsButtonText: string;
        contentBg: string;
    };

    // SettingsView
    settings: {
        updateText: string;
        updateButtonBg: string;
    };

    // TextRecordView
    textRecord: {
        notEditableText: string;
        editBtnLabel: string;
    };

    // WelcomeView
    welcome: {
        mailButton: {
            border: string;
            title: string;
        };
    };

    // JournalTypeView
    journalType: {
        btnTitle: string;
        nextPromptText: string;
        nextPromptBg: string;
    };

    // SurveyScreenView
    survey: {
        btnBackgroundColor: string;
        btnFontColor: string;
    };
};
