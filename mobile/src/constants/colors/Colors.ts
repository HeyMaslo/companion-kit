import { ProjectColorsSchema } from './shape';

const Colors: ProjectColorsSchema = {
    // ========== PERSONA ==============

    personaColors: [
        '#BABFBF',
        '#D3DADA',
        '#E6ECEC',
        '#FCFCFC',
        '#EAE8EB',
        '#D6D1D8',
        '#AFA7B1',
        '#3F3C44',
    ],

// ========== TYPOGRAPHY ==============

    typography: {
        h1: '#3F3C44',
        h2: '#3F3C44',
        h3: '#3F3C44',
        h4: '#3F3C44',
        p1: '#3F3C44',
        p2: '#3F3C44',
        p3: '#3F3C44',
        p4: '#AFA7B1',
        btnTitle: '#FFFFFF',
        labelMedium: '#AFA7B1',
        labelSmall: '#3F3C44',
    },

    // ========== COMPONENTS ==============

    // Checkbox
    checkboxChecked: '#3F3C44',

    // AudioPlayer
    audioPlayerTriangleColor: '#AFA7B1',
    audioPlayerRectBgColor: '#AFA7B1',
    audioPlayerThumbAndActivityColor: '#AFA7B1',
    audioPlayerSliderMinTrack: '#AFA7B1',
    audioPlayerAltColor: '#3F3C44',

    // BubbleChart
    bubbleChartSVGText: 'rgba(175, 167, 177, 0.6)',
    bubbleChartDarkTheme: {
        mainTextColor: {
            large: '#FFFFFF',
            small: '#AFA7B1',
        },
        fill: {
            large: '#3F3C44',
            small: '#D6D1D8',
        },
    },
    bubbleChartLightTheme: {
        mainTextColor: {
            large: '#FFFFFF',
            small: '#BABFBF',
        },
        fill: {
            small: '#FFFFFF',
        },
        stroke: {
            large: 'transparent',
            small: 'transparent',
        },
    },

    // Button
    button: {
        defaultBg: '#3F3C44',
        defaultBorder: '#3F3C44',
        defaultUnderlayColor: '#3F3C44',
        disabledBg: 'transparent',
        disabledBorder: 'rgba(63, 60, 68, 0.4)',
        disabledText: 'rgba(63, 60, 68, 0.4)',
        transparentText: '#3F3C44',
        buttonForm: {
            bg: '#E7E1F2',
            border: 'transparent',
            text: '#3F3C44',
            underlay: '#CFCAD9',
        },
        extendButtonText: '#BABFBF',
    },

    // Dots
    dotBg: '#3F3C44',
    dotActiveBg: '#BABFBF',

    // GradientChart
    gradientChartSentimentColor: '#3F3C44',
    gradientChartDateColor: '#AFA7B1',
    gradientChartSvgBg: '#D6D1D8',

    // Link
    linkDefault: '#3F3C44',

    // ProgressBarCircle
    ProgressBarCircle: {
        progressBarCircleLine: 'rgba(63, 60, 68, 0.2)',
        ProgressBarCircleText: '#AFA7B1',
        gradColor1: '#D6D1D8',
        gradColor2: '#BABFBF',
        gradColor3: '#D3DADA',
        gradColor4: '#3F3C44',
        gradColor5: '#3F3C44',
    },

    // ProgressButton
    progressButtonIndicatorBg: '#AFA7B1',
    progressButtonText: '#fff',
    progressButtonloadWrapBg: '#3F3C44',

    // PromptModal
    promptModalBg: '#F8FAFF',
    promptModalMessage: '#BBB7C6',
    promptModalTitle: '#3F3C44',

    // Input
    inputText: '#3F3C44',
    inputPlaceholder: 'rgba(117, 105, 140, 0.5)',
    inputErrorText: '#FF6254',

    // GradientChartBlock
    gradientChartBlockTitle1: '#AFA7B1',
    gradientChartBlockTitle2: '#3F3C44',

    // MoodSlider
    moodSlider: {
        thumbTintColor: '#3F3C44',
    },

    card: {
        title: '#3F3C44',
        description: '#AFA7B1',
        underlay: {
            primary: 'rgba(117, 105, 140, 0.4)',
            secondary: '#FCFCFF',
        },
    },

    // StoryCard
    storyCard: {
        bg: '#FFFFFF',
        title: '#3F3C44',
        date: '#746F82',
        privacyText: '#3F3C44',
    },

    // TipCard
    tipCardBg: '#3F3C44',
    tipCardTitle: '#FFFFFF',
    tipCardInfo: '#AFA7B1',

    // LocationCardS
    locationCardS: {
        cardTitle: {
            default: '#3F3C44',
            active: '#FFFFFF',
        },
        cardLayerBg: '#AFA7B1',
    },

    // GradientView
    gradientView: {
        fallbackColor: ['#AFA7B1', '#3F3C44'],
    },

    // RadioButton
    radioButton: {
        checkedBg: '#3F3C44',
    },

    // PLaceholder
    placeholder: {
        bg: '#FFFFFF',
        text: '#3F3C44',
    },

    // SelectItem
    selectItem: {
        bg: '#3F3C44',
        activeBg: '#3F3C44',
        activeText: '#FFFFFF',
        activeBorder: '#FFFFFF',
    },

    // Switch
    switch: {
        activeBg: '#3F3C44',
        inactiveBg: '#AFA7B1',
    },

    // Toaster
    toaster: {
        bg: '#3F3C44',
        text: '#FFFFFF',
    },

    // ========== BASE ==============

    pageBg: '#FCFCFC',

    moodColors: {
        Undefined: '#FFFFFF',
        VeryPositive: '#4DB24D',
        Positive: '#4DB290',
        Mixed: '#FFCF6E',
        Difficult: '#FFAA6E',
        Rough: '#FF6254',
    },

    borderColor: 'rgba(23, 15, 46, 0.1)',

    gradientMaskColor1: '#FCFCFF',
    gradientMaskColor2: 'rgba(252, 252, 255, 0)',

    secondarySubtitle: '#3F3C44',

    // ========== SCREENS ==============

    // ConsentView
    consent: {
        textBlockBg: '#3F3C44',
        contentHeading: '#fff',
        contentPrimaryColor: '#BABFBF',
        buttonDisabledBg: 'rgba(255, 255, 255, 0.2)',
        buttonDisabledText: '#3F3C44',
        contentBodyText: '#BABFBF',
    },

    // EnterPasswordView
    enterPassword: {
        linkColor: '#3F3C44',
    },

    // HomeView
    home: {
        headingTitle: '#3F3C44',
        bg: '#E6ECEC',
    },

    // NotificationsSettingsView
    notificationsSettings: {
        exactCard: {
            bg: 'transparent',
        },
        exact: {
            title: '#3F3C44',
            desc: '#BABFBF',
        },
    },

    // ProfileView
    profile: {
        changePhoto: {
            border: '#BABFBF',
            photoBg: '#BABFBF',
        },
        subTextPrimaryColor: '#AFA7B1',
        subTextSecondaryColor: '#3F3C44',
        settingsBg: '#F5F5FA',
    },

    // RecordView
    record: {
        counterTextColor: '#BABFBF',
        triangleBorder: '#3F3C44',
        pauseSquareBg: '#3F3C44',
        controlsButtonText: '#3F3C44',
        contentBg: '#BABFBF',
    },

    // SettingsView
    settings: {
        updateText: '#FFFFFF',
        updateButtonBg: '#3F3C44',
    },

    // TextRecordView
    textRecord: {
        notEditableText: '#FFFFFF',
        editBtnLabel: '#3F3C44',
    },

    // WelcomeView
    welcome: {
        mailButton: {
            border: '#3F3C44',
            title: '#3F3C44',
        },
    },

    // JournalTypeView
    journalType: {
        btnTitle: '#3F3C44',
        nextPromptText: '#3F3C44',
        nextPromptBg: '#F5F5FA',
    },

    survey: {
        btnBackgroundColor: '#F5F5FA',
        btnFontColor: '#3E3C43',
    },

};

export default Colors;